'server-only'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ""

export const sendTelegramNotification = async (message: string) => {
  console.log(`[STUB - TELEGRAM] 📱 Broadcasting: ${message}`)

  // TODO 
  // await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, ...)

  return { success: true }
}