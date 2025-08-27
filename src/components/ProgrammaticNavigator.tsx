'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface ProgrammaticNavigatorProps {
  targetPath: string;
  buttonText: string;
}

export default function ProgrammaticNavigator({
  targetPath,
  buttonText,
}: ProgrammaticNavigatorProps) {
  const router = useRouter();

  const handleClick = () => {
    // Use Next.js Route type for type safety
    router.push(targetPath as import('next').Route);
  };

  return <Button onClick={handleClick}>{buttonText}</Button>;
}
