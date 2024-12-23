import AdMaterialCard from './AdMaterialCard'
import { AdMaterial } from '../../types/adMaterial'

interface AdMaterialListProps {
  materials: AdMaterial[]
}

export default function AdMaterialList({ materials }: AdMaterialListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <AdMaterialCard key={material.id} material={material} />
      ))}
    </div>
  )
}

