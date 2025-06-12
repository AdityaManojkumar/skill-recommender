document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const input = document.getElementById("chat-input");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const question = input.value.toLowerCase();
      let response = "Sorry, I don't understand yet.";

      if (question.includes("project")) {
        response = "Tell me your skills and semester, and I’ll suggest some cool projects!";
      } else if (question.includes("leetcode")) {
        response = "Sure! I can show you some LeetCode questions. Just tell me your skill.";
      }

      chatbox.innerHTML += `<div>You: ${input.value}</div><div>Bot: ${response}</div>`;
      input.value = "";
    }
  });
});
