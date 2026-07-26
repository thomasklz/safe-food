export default function handler(req: any, res: any) {
  const isKeyAvailable = !!process.env.GEMINI_API_KEY;
  res.status(200).json({
    hasApiKey: isKeyAvailable,
    appName: 'SafeFood IA',
    currentTime: new Date().toISOString()
  });
}
