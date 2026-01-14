import { Logo } from './Logo';
import { HeaderActions } from './HeaderActions';

type Props = {
  onNewProduct?: () => void;
};

export function Header({ onNewProduct }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <Logo />

      <HeaderActions />
    </header>
  );
}
