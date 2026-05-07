const register = require("../models/user/register.mongo");

async function deleteUnverifiedAccounts() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await register.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneHourAgo },
    });

    if (result.deletedCount > 0) {
      console.log(
        `🧹 Cleanup: Deleted ${result.deletedCount} unverified accounts`,
      );
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

module.exports = {
  deleteUnverifiedAccounts: deleteUnverifiedAccounts,
};
