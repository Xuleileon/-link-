import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdMaterial } from '../../types/adMaterial'

interface AdMaterialCardProps {
  material: AdMaterial
}

export default function AdMaterialCard({ material }: AdMaterialCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{material.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video relative mb-4">
          <Image
            src={material.imageUrl}
            alt={material.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="space-y-2">
          <p><strong>Type:</strong> {material.type}</p>
          <p><strong>Impressions:</strong> {material.impressions.toLocaleString()}</p>
          <p><strong>Clicks:</strong> {material.clicks.toLocaleString()}</p>
          <p><strong>CTR:</strong> {(material.clicks / material.impressions * 100).toFixed(2)}%</p>
        </div>
      </CardContent>
    </Card>
  )
}

