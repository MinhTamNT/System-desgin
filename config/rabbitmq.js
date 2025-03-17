import amqp from "amqplib";
import sendEmail from "./sendEmail"; // Hàm gửi email của bạn
const sendToQueue = async (queue, message) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log(`Message sent to queue ${queue}: ${message}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error sending message to queue:", error);
  }
};

const receiveEmails = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("email_queue", { durable: true });

    console.log("Waiting for messages in email_queue...");
    channel.consume("email_queue", async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());
        console.log(`Processing email: ${emailData.to}`);

        await sendEmail(
          emailData.to,
          emailData.subject,
          emailData.type,
          emailData.body
        );
        channel.ack(msg); // Đánh dấu đã xử lý xong
      }
    });
  } catch (error) {
    console.error("Error processing email queue:", error);
  }
};

export { sendToQueue, receiveEmails };
