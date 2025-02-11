#!/usr/bin/env bun
import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput, useStdout } from "ink";
import { Tab, Tabs } from "ink-tab";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import TextInput from "ink-text-input";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ChatProps = {
  height: number;
};

type LogsProps = {
  height: number;
};

const useTerminalSize = () => {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState({
    width: stdout.columns || 80,
    height: stdout.rows || 24,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: stdout.columns,
        height: stdout.rows,
      });
    }

    stdout.on("resize", handleResize);
    return () => {
      stdout.off("resize", handleResize);
    };
  }, [stdout]);

  return dimensions;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");

  return (
    <Box flexDirection="column">
      {/* Messages area with padding at the bottom for input visibility */}
      <Box flexDirection="column">
        {messages.map((msg, i) => (
          <Text key={i} color={msg.role === "user" ? "green" : "blue"}>
            [{msg.timestamp}] {msg.role === "user" ? "You" : "Assistant"}:{" "}
            {msg.content}
          </Text>
        ))}
      </Box>

      {/* Fixed input area at bottom */}
      <Box
        borderStyle="single"
        // bottom={0}
        width="100%"
      >
        <Text>❯ </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={(value) => {
            if (value.trim()) {
              const newMessage: Message = {
                role: "user",
                content: value,
                timestamp: new Date().toLocaleTimeString(),
              };
              setMessages((prev) => [...prev, newMessage]);
              setInput("");
            }
          }}
        />
      </Box>
    </Box>
  );
};

const Logs = () => (
  <Box flexDirection="column" overflow="hidden">
    {Array.from({ length: 10 }).map((_, i) => (
      <Text key={i}>
        Log entry #{i + 1} - {new Date().toLocaleTimeString()}
      </Text>
    ))}
  </Box>
);

const Memory = () => (
  <Box flexDirection="column" padding={1}>
    <Text>Memory Usage Stats</Text>
    <Text>
      Heap: {(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
    </Text>
    <Text>RSS: {(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB</Text>
    <Text>
      External: {(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB
    </Text>
  </Box>
);

const App = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const { width, height } = useTerminalSize();

  useInput((input, key) => {
    // Exit on Ctrl+Q
    if (key.ctrl && input === "q") {
      process.exit(0);
    }

    // Tab switching with numbers
    if (input >= "1" && input <= "3") {
      const tabIndex = parseInt(input) - 1;
      const tabNames = ["chat", "logs", "memory"];
      if (tabNames[tabIndex]) {
        setActiveTab(tabNames[tabIndex]);
      }
    }
  });

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Header */}
      <Gradient name="rainbow">
        <BigText text="DREAMS" />
      </Gradient>

      {/* Status Bar */}
      <Box borderStyle="single">
        <Text>
          Size: {width}x{height} | Tab: {activeTab} | 1-3: Switch tabs | Ctrl+Q:
          Exit
        </Text>
      </Box>

      {/* Main Content */}
      <Box flexDirection="row" height="100%">
        {/* Left Panel */}
        <Box width={"80%"} borderStyle="single">
          <Box flexDirection="column">
            <Tabs onChange={setActiveTab}>
              <Tab name="chat">💬 Chat</Tab>
              <Tab name="logs">📝 Logs</Tab>
              <Tab name="memory">💾 Memory</Tab>
            </Tabs>

            <Box padding={1}>
              {activeTab === "chat" && <Chat />}
              {activeTab === "logs" && <Logs />}
              {activeTab === "memory" && <Memory />}
            </Box>
          </Box>
        </Box>

        {/* Right Panel */}
        <Box width={"20%"} borderStyle="single" flexDirection="column">
          <Box flexDirection="column" padding={1}>
            <Text bold>System Stats</Text>
            <Text>Uptime: {process.uptime().toFixed(0)}s</Text>
            <Text>
              Memory:{" "}
              {(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB
            </Text>
            <Text>CPU: {(process.cpuUsage().user / 1000000).toFixed(2)}s</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Render the app
const { waitUntilExit } = render(<App />);
await waitUntilExit();
