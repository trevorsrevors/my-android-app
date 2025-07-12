import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: any;
  color?: string;
}

export default function Icon({ name, size = 24, style, color }: IconProps) {
  const iconColor = color || style?.color || colors.text;
  
  return (
    <Ionicons 
      name={name} 
      size={size} 
      color={iconColor} 
      style={style} 
    />
  );
}
