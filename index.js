const Twit = require("twit");
const cron = require("node-cron");

//for testing purpose, am not hiding my api keys in .env file
const T = new Twit({
    consumer_key: "YOUR_CONSUMER_KEY",
    consumer_secret: "YOUR_CONSUMER_SECRET",
    access_token: "YOUR_ACCESS_TOKEN",
    access_token_secret: "YOUR_ACCESS_SECRET",
});

//function used to convert standard time format into cron time format
function convertToCronFormat(time) {
    const date = new Date(time);
    if (date < new Date()) {
        return null;
    }
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;

    return `${seconds} ${minutes} ${hours} ${day} ${month} *`;
}

function scheduleDM(recipientHandle, message, scheduleTime) {

    const cronTime = convertToCronFormat(scheduleTime);

    if (cronTime === null) {
        console.log("please enter future time.");
        return;
    }

    cron.schedule(cronTime, async () => {
        try {
            // Get the recipient's user ID
            const { data: user } = await T.get("users/show", {
                screen_name: recipientHandle,
            });
          const recipientId = user.id_str;
      

            // Schedule the DM to be sent
            const scheduledDM = await T.post("direct_messages/events/new", {
                event: {
                    type: "message_create",
                    message_create: {
                        target: {
                            recipient_id: recipientId,
                        },
                        message_data: {
                            text: message,
                        },
                    },
                },
            });

          console.log(`DM scheduled successfully to : ${recipientHandle}`);
          return;

        } catch (error) {
          console.error(error);
          return;
        }
    });
}

//please enter the time in format : YYYY-MM-DDTHH:MM:SS
const recipientHandle = "YLalpotu";
const message = "Hello Yash";
const scheduleTime = "2023-01-01T22:14:00";

// scheduleDM("YLalpotu", "Hello Yash", "2023-01-01T21:53:35");
scheduleDM(recipientHandle, message, scheduleTime)
