const { messaging } = require("../firebaseAdmin");
const { io } = require("../server");
const Admin = require("../models/Admin"); // Make sure to import your Admin model

class NotificationService {
  static async sendToAdmin(adminId, order, type) {
    try {
      // Get all admin FCM tokens from database
      const admins = await Admin.find({});
      const allTokens = admins.flatMap((admin) => admin.fcmTokens || []);

      if (!allTokens.length) {
        console.log("No FCM tokens found for any admin");
        this.sendViaSocket(order, type);
        return;
      }

      // Prepare the notification payload
      const message = {
        notification: {
          title: type === "newOrder" ? "New Order Received" : "Order Updated",
          body: `Order from ${order.name || "customer"} (${order.status})`,
        },
        data: {
          type,
          order: JSON.stringify(order),
          click_action: "FLUTTER_NOTIFICATION_CLICK", // For deep linking if needed
        },
        tokens: allTokens.filter((t) => t), // Filter out any empty tokens
      };

      // Send via FCM
      const response = await messaging.sendMulticast(message);
      console.log(
        "FCM Notification sent:",
        response.successCount,
        "successful"
      );

      // Check for failed tokens and remove them
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(message.tokens[idx]);
          }
        });
        await this.cleanupFailedTokens(failedTokens);
      }
    } catch (fcmError) {
      console.error("FCM error:", fcmError);
      this.sendViaSocket(order, type);
    }
  }

  static async cleanupFailedTokens(failedTokens) {
    if (!failedTokens.length) return;

    console.log("Cleaning up", failedTokens.length, "failed FCM tokens");

    try {
      // Remove failed tokens from all admin documents
      await Admin.updateMany(
        {},
        { $pull: { fcmTokens: { $in: failedTokens } } }
      );
    } catch (error) {
      console.error("Error cleaning up failed tokens:", error);
    }
  }

  static sendViaSocket(order, type) {
    try {
      const eventName = type === "newOrder" ? "newOrder" : "orderUpdated";
      io.emit(eventName, order);
      console.log("Notification sent via Socket.IO");
    } catch (socketError) {
      console.error("Socket.IO error:", socketError);
    }
  }
}

module.exports = NotificationService;
