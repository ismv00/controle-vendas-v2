type Props = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-appbg">
      <div className="relative hidden w-1/2 shrink-0 bg-dark lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/login-screen.jpg"
          alt=""
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/10 to-dark/25" />

        <div className="absolute left-10 top-10 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-logo bg-accent text-[14px] font-bold text-white">
            VF
          </div>
          <div className="leading-tight text-white">
            <p className="text-[14px] font-bold">Venda Fácil</p>
            <p className="text-[11px] text-white/70">Controle de vendas</p>
          </div>
        </div>

        <div className="absolute bottom-12 left-10 right-10">
          <p className="max-w-md text-[24px] font-bold leading-snug tracking-[-.01em] text-white">
            Organize suas vendas, produtos e clientes em um só lugar.
          </p>
          <p className="mt-3 max-w-sm text-[13px] text-white/70">
            Feito para pequenos negócios que querem clareza sobre o que vendem e quanto lucram.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
