import { useMemo } from 'react';

interface AvatarProps {
  seed: string;
}

export function Avatar({ seed }: AvatarProps) {
  const avatarUrl = useMemo(() => {
    // 使用 DiceBear 的 pixel-art 風格
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
  }, [seed]);

  return (
    <div className="avatar-container">
      <img src={avatarUrl} alt={`Avatar ${seed}`} />
    </div>
  );
}
