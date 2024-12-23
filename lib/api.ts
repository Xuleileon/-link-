import { VideoAdMaterial } from '../types/videoAdMaterial'

const generateCurveData = (length: number, maxValue: number): [number, number][] => {
  return Array.from({ length }, (_, i) => {
    const timestamp = Date.now() + i * 600000 // 10 minutes intervals
    const value = Math.random() * maxValue
    return [timestamp, value]
  })
}

const mockVideoAdMaterials: VideoAdMaterial[] = Array.from({ length: 30 }, (_, i) => ({
  id: `${i + 1}`,
  name: `视频广告 ${i + 1}`,
  duration: `${Math.floor(Math.random() * 60) + 10}秒`,
  impressions: Math.floor(Math.random() * 1000000) + 10000,
  clicks: Math.floor(Math.random() * 50000) + 1000,
  ctr: Math.random() * 5 + 1,
  videoUrl: `https://example.com/video${i + 1}.mp4`,
  consumptionCurve: generateCurveData(144, 1000), // 24 hours of data
  roiCurve: generateCurveData(144, 5), // 24 hours of data
}))

export async function getVideoAdMaterials(): Promise<VideoAdMaterial[]> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  return mockVideoAdMaterials
}

