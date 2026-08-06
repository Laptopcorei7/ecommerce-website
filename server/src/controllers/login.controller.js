const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const register = require("../models/user/register.mongo");

const SESSION_FILE = path.join(__dirname, "../../data/sessions.json");
const SESSION_DURATION = 24 * 60 * 60 * 1000;
let sessions = {};

// Deliberately synchronous: this runs once while the module is being required,
// before the server binds a port. Doing it asynchronously would let the first
// requests through against an empty session map and log everyone out.
try {
  if (fs.existsSync(SESSION_FILE)) {
    const data = fs.readFileSync(SESSION_FILE, "utf-8").trim();
    sessions = data ? JSON.parse(data) : {};
    console.log("✓ Loaded", Object.keys(sessions).length, "sessions from file");

    cleanExpiredSessions();
  }
} catch (err) {
  console.error("Error loading sessions:", err);
  sessions = {};
}

let savePending = false;
let saveInFlight = null;

// Unlike the load above, this runs on the request path — every login, logout
// and password change calls it — so it must not stall the event loop.
//
// Callers do not await it. Overlapping calls collapse into a single trailing
// write of the latest state, and the write goes to a temp file that is renamed
// over the real one, so a crash mid-write cannot leave a truncated
// sessions.json that the next boot would fail to parse.
function saveSessions() {
  savePending = true;

  if (saveInFlight) {
    return saveInFlight;
  }

  saveInFlight = (async () => {
    try {
      while (savePending) {
        savePending = false;

        const snapshot = JSON.stringify(sessions, null, 2);
        const tmpFile = `${SESSION_FILE}.${process.pid}.tmp`;

        await fsp.mkdir(path.dirname(SESSION_FILE), { recursive: true });
        await fsp.writeFile(tmpFile, snapshot);
        await fsp.rename(tmpFile, SESSION_FILE);
      }
    } catch (err) {
      console.error("Error saving sessions:", err);
    } finally {
      saveInFlight = null;
    }
  })();

  return saveInFlight;
}

function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

function cleanExpiredSessions() {
  const now = Date.now();
  let deletedCount = 0;

  for (const [sessionId, sessionData] of Object.entries(sessions)) {
    if (sessionData.expiresAt && sessionData.expiresAt < now) {
      delete sessions[sessionId];
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    saveSessions();
    console.log(`✓ Cleaned ${deletedCount} expired session(s)`);
  }

  return deletedCount;
}

function getSession(sessionId) {
  const session = sessions[sessionId];

  if (!session) {
    return null;
  }

  if (session.expiresAt && session.expiresAt < Date.now()) {
    delete sessions[sessionId];
    saveSessions();
    return null;
  }

  return session;
}

async function httpLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Invalid data types",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  try {
    const user = await register.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(403).json({
        error: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const sessionId = generateSessionId();
    sessions[sessionId] = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    };

    saveSessions();

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      error: "Login failed. Please try again.",
    });
  }
}

async function httpAdminLogin(req, res) {
  const { employeeId, email, password } = req.body;

  if (!employeeId || !email || !password) {
    return res.status(404).json({
      error: "Employee Id, email and password are required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  try {
    const user = await register.findOne({
      email: email.toLowerCase(),
      employeeId: employeeId,
    });

    if (!user) {
      return res.status(403).json({
        error: "Invalid credentials",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).json({
        error: "Invalid credentials",
      });
    }

    const sessionId = generateSessionId();
    sessions[sessionId] = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    };

    saveSessions();

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Admin login sucessful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({
      error: "Login failed. Please try again.",
    });
  }
}

async function httpLogout(req, res) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "No active session" });
  }

  delete sessions[sessionId];

  saveSessions();

  res.clearCookie("sessionId");

  return res.status(200).json({
    message: "Logout successful",
  });
}

async function httpGetMe(req, res) {
  return res.status(200).json({
    user: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

function getUserSessions(userId) {
  const userSessions = [];

  for (const [sessionId, sessionData] of Object.entries(sessions)) {
    if (sessionData.userId.toString() === userId.toString()) {
      userSessions.push({ sessionId, ...sessionData });
    }
  }

  return userSessions;
}

function deleteAllUserSessions(userId) {
  let deletedCount = 0;

  for (const [sessionId, sessionData] of Object.entries(sessions)) {
    if (sessionData.userId.toString() === userId.toString()) {
      delete sessions[sessionId];
      deletedCount++;
    }
  }

  saveSessions();
  return deletedCount;
}

function deleteOtherUserSessions(userId, currentSessionId) {
  let deletedCount = 0;

  for (const [sessionId, sessionData] of Object.entries(sessions)) {
    if (
      sessionData.userId.toString() === userId.toString() &&
      sessionId !== currentSessionId
    ) {
      delete sessions[sessionId];
      deletedCount++;
    }
  }

  saveSessions();
  return deletedCount;
}

function updateUserSessions(userId, updates) {
  let updatedCount = 0;

  for (const sessionData of Object.values(sessions)) {
    if (sessionData.userId.toString() === userId.toString()) {
      Object.assign(sessionData, updates);
      updatedCount++;
    }
  }

  saveSessions();
  return updatedCount;
}

module.exports = {
  getSession: getSession,
  httpLogin: httpLogin,
  httpLogout: httpLogout,
  httpGetMe: httpGetMe,
  httpAdminLogin: httpAdminLogin,
  getUserSessions: getUserSessions,
  deleteAllUserSessions: deleteAllUserSessions,
  deleteOtherUserSessions: deleteOtherUserSessions,
  updateUserSessions: updateUserSessions,
  cleanExpiredSessions: cleanExpiredSessions,
};
