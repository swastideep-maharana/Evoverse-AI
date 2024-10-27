"use client";

import { useCallback, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Code } from "lucide-react";
import { Heading } from "@/components/heading";
import { formSchema } from "./constants";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/empty";

type MessageType = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const CodePage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const { register, handleSubmit, watch, formState, reset } = methods;
  const characterLimit = 200;
  const currentMessage = watch("prompt") || "";
  const remainingCharacters = characterLimit - currentMessage.length;

  const handleMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, { role, content, timestamp }]);
    },
    []
  );

  const clearChat = () => {
    setMessages([]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    const userMessage: MessageType = {
      role: "user",
      content: values.prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);
    setLoading(true);

    try {
      const response = await axios.post("/api/code", {
        messages: [...messages, userMessage],
      });

      if (response.data?.content) {
        handleMessage("assistant", response.data.content);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send message. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
      console.error("Conversation error:", err);
    } finally {
      reset();
      router.refresh();
      setTyping(false);
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        <Heading
          title="Code Generation"
          description="Generate code using descriptive text."
          icon={Code}
          iconColor="text-green-500"
          bgColor="bg-green-600/10"
        />
        <div className="px-4 lg:px-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 grid grid-cols-12 gap-2"
          >
            <div className="col-span-12 lg:col-span-10">
              <FormControl>
                <Input
                  {...register("prompt", { maxLength: characterLimit })}
                  className="border-0 outline-none focus-visible:ring-0"
                  disabled={formState.isSubmitting}
                  placeholder="Simple toggle button using react hooks."
                />
              </FormControl>
              <p className={`text-sm mt-1 ${remainingCharacters < 20 ? "text-red-500" : "text-gray-500"}`}>
                {remainingCharacters} characters remaining
              </p>
            </div>
            <Button
              className="col-span-6 lg:col-span-1 w-full"
              disabled={formState.isSubmitting || remainingCharacters < 0}
            >
              {formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Generate"}
            </Button>
            <Button type="button" onClick={clearChat} className="col-span-6 lg:col-span-1 w-full">
              Clear Chat
            </Button>
          </form>
          {typing && <div className="typing-animation">...</div>} {/* Placeholder for typing animation */}
          {loading && (
            <div className="mt-2 text-gray-500 text-lg font-semibold">
              Thinking... 🤔
            </div>
          )}
          {error && <div className="text-red-500 mt-2">{error}</div>}
          <div className="space-y-4 mt-4">
            {messages.length === 0 ? (
              <Empty label="No messages yet. Start a conversation!" />
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`py-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.role === "user" 
                        ? "bg-blue-200 text-blue-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    <span className="font-semibold">
                      {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:
                    </span>
                    <span className="ml-2">
                      <pre>{msg.content}</pre>
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default CodePage;
