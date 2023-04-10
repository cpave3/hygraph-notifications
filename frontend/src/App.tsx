import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

// Define some types for better autocomplete
type Intent = "success" | "warning" | "error" | "info";

type MessageType = "notification" | "connection";

type MessageData = {
  notification: {
    title: string;
    message: string;
    intent: Intent;
  };
  connection: null;
};

type Message<T extends MessageType> = {
  id: string;
  type: T;
  data: MessageData[T];
};

// Define a map of intents to Tailwind CSS classes to color your notifications
const intentMap: Record<Intent, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

function App() {
  // Store the message history in state
  const [messageHistory, setMessageHistory] = useState<Message<MessageType>[]>(
    []
  );

  // Connect to the websocket server
  const [socketUrl] = useState("ws://localhost:8999");
  const { lastMessage } = useWebSocket(socketUrl);

  // When a new message is received, parse it and add it to the message history
  useEffect(() => {
    if (lastMessage !== null) {
      const parsedData = JSON.parse(lastMessage.data);
      setMessageHistory((prev) => prev.concat(parsedData));
    }
  }, [lastMessage, setMessageHistory]);

  // Define a function to dismiss a notification
  const handleDismiss = useCallback(
    (message: Message<"notification">) => {
      setMessageHistory((prev) => prev.filter((m) => m.id !== message.id));
    },
    [setMessageHistory]
  );

  // Filter the message history to only include notifications
  const notifications = messageHistory.filter(
    (data): data is Message<"notification"> => data.type === "notification"
  );

  // Render the notifications
  if (notifications.length > 0) {
    return (
      <div className="bg-gray-800 text-white flex justify-center items-center h-full w-full flex-col p-12">
        <h1 className="text-3xl font-bold font-sans mb-4">Notifications</h1>
        <ul className="w-full">
          {notifications.map((message, idx) => (
            <li
              key={message.id}
              className={`w-full p-2 rounded-md my-2 flex items-start justify-start flex-col ${
                intentMap[message.data.intent]
              }`}
            >
              <div className="font-bold flex justify-between w-full">
                <span>{message.data?.title}</span>
                <button onClick={() => handleDismiss(message)}>x</button>
              </div>
              <div>{message.data?.message}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // If there are no notifications, render a waiting message
  return (
    <div className="bg-gray-800 text-white flex justify-center items-center h-full w-full">
      <div>Waiting for notifications...</div>
    </div>
  );
}

export default App;
