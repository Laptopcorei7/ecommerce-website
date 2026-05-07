const registers = require("./register.mongo");

async function findAllUsers() {
  return await registers.find(
    {},
    {
      _id: 0,
      __v: 0,
    },
  );
}

async function saveRegisteredUsers(register) {
  try {
    const newUser = await registers.create({
      name: register.name,
      email: register.email,
      password: register.password,
      role: register.role,
      isVerified: register.isVerified,
      verificationToken: register.verificationToken,
      verificationTokenExpires: register.verificationTokenExpires,
    });
    return newUser;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Email already exists", { cause: err });
    }
    throw err;
  }
}

module.exports = {
  findAllUsers: findAllUsers,
  saveRegisteredUsers: saveRegisteredUsers,
};
