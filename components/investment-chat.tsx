"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ImageIcon } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface ChatMessage {
  id: string
  message: string | null
  screenshot_url: string | null
  is_admin: boolean
  created_at: string
  sender_id: string
}

interface InvestmentChatProps {
  investmentId: string
  userId: string
  lang?: Language
}

export function InvestmentChat({ investmentId, userId, lang = "en" }: InvestmentChatProps) {
  const { t } = useTranslation(lang)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
    const subscription = subscribeToMessages()
    return () => {
      subscription?.unsubscribe()
    }
  }, [investmentId])

  const loadMessages = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("investment_id", investmentId)
      .order("created_at", { ascending: true })

    if (data) setMessages(data)
  }

  const subscribeToMessages = () => {
    const supabase = createClient()
    return supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `investment_id=eq.${investmentId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        },
      )
      .subscribe()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadScreenshot = async (file: File) => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `investment-proofs/${fileName}`

    const { error: uploadError } = await supabase.storage.from("investments").upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from("investments").getPublicUrl(filePath)

    return publicUrl
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !screenshot) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      let screenshotUrl = null
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot)
      }

      await supabase.from("chat_messages").insert({
        investment_id: investmentId,
        sender_id: userId,
        message: newMessage.trim() || null,
        screenshot_url: screenshotUrl,
        is_admin: false,
      })

      setNewMessage("")
      setScreenshot(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chatWithAdmin")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.is_admin ? "bg-slate-100 text-slate-900" : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.message && <p className="text-sm">{msg.message}</p>}
                  {msg.screenshot_url && (
                    <img
                      src={msg.screenshot_url || "/placeholder.svg"}
                      alt="Screenshot"
                      className="mt-2 max-w-full rounded"
                    />
                  )}
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {previewUrl && (
          <div className="relative">
            <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-32 rounded border" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1"
              onClick={() => {
                setScreenshot(null)
                setPreviewUrl(null)
              }}
            >
              Remove
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder={t("sendMessage")}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <label htmlFor="screenshot-upload">
            <Button type="button" variant="outline" size="icon" disabled={isLoading} asChild>
              <span>
                <ImageIcon className="h-4 w-4" />
              </span>
            </Button>
            <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
          <Button onClick={sendMessage} disabled={isLoading || (!newMessage.trim() && !screenshot)} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
