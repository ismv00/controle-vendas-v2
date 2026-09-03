"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Tag as TagIcon,
  Bell,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Nocturne design tokens (see design-refer/.../_ds/.../styles.css)
const T = {
  bg: "#161826",
  surface: "#232532",
  text: "#e9e9ed",
  accent: "#9184d9",
  accent100: "#f5f4ff",
  accent300: "#d2cefd",
  accent800: "#423a6a",
  accent900: "#2b2741",
  neutral300: "#cfd3e5",
  neutral400: "#b2b6ca",
  neutral500: "#9397ab",
  neutral600: "#75798c",
  neutral800: "#3f424d",
  neutral900: "#292b31",
  divider: "rgba(233,233,237,0.14)",
  shadowSm: "0 0 0 1px #3f424d",
  shadowMd: "0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,0.55)",
};

const features = [
  {
    icon: Package,
    title: "Produtos e categorias",
    desc: "Cadastre produtos com custo, margem e preço de venda calculado automaticamente.",
  },
  {
    icon: Users,
    title: "Gestão de clientes",
    desc: "Histórico completo de compras por cliente. Saiba quem compra mais e quem sumiu.",
  },
  {
    icon: TrendingUp,
    title: "Dashboard de lucro",
    desc: "Faturamento, lucro real e margem média. Filtros por mês e por cliente.",
  },
  {
    icon: TagIcon,
    title: "Tabela de preços",
    desc: "Informe o custo e as despesas — o sistema calcula o preço ideal pra você.",
  },
  {
    icon: Bell,
    title: "Alertas automáticos",
    desc: "E-mails com clientes que não compram há mais de 20 dias. Nunca perca um reengajamento.",
  },
  {
    icon: ShieldCheck,
    title: "Dados isolados",
    desc: "Cada usuário vê apenas os seus próprios dados. Segurança garantida pelo Firebase.",
  },
];

const plans = [
  {
    name: "Básico",
    desc: "Para quem está começando",
    price: "29",
    annual: "290",
    featured: false,
    items: [
      "Até 50 clientes",
      "Produtos ilimitados",
      "Dashboard básico",
      "1 usuário",
    ],
  },
  {
    name: "Pro",
    desc: "Para negócios em crescimento",
    price: "59",
    annual: "590",
    featured: true,
    items: [
      "Clientes ilimitados",
      "Alertas automáticos",
      "Relatórios avançados",
      "Até 3 usuários",
    ],
  },
  {
    name: "Negócio",
    desc: "Para times maiores",
    price: "99",
    annual: "990",
    featured: false,
    items: [
      "Tudo do Pro",
      "Usuários ilimitados",
      "Suporte prioritário",
      "API de integração",
    ],
  },
];

const tableRows = [
  { date: "17/05", client: "Gabrieli G.", total: "R$ 105", profit: "R$ 74" },
  { date: "15/05", client: "Jessica D.", total: "R$ 210", profit: "R$ 148" },
  { date: "12/05", client: "Aline M.", total: "R$ 70", profit: "R$ 42" },
  { date: "08/05", client: "Cláudia R.", total: "R$ 180", profit: "R$ 127" },
];

const heroKpis = [
  { label: "Vendas", value: "40" },
  { label: "Faturamento", value: "R$ 3.254" },
  { label: "Lucro total", value: "R$ 2.301", accent: true },
  { label: "Margem", value: "70,7%", accent: true },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (loading || user) return null;

  return (
    <main
      className={inter.className}
      style={{
        background: T.bg,
        color: T.text,
        minHeight: "100vh",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(22,24,38,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              border: `1px solid ${T.accent}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
            }}
          >
            <ShoppingCart size={16} />
          </div>
          <span
            style={{
              fontWeight: 500,
              fontSize: "15px",
              letterSpacing: "-0.3px",
            }}
          >
            Venda Fácil
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              ["Funcionalidades", "#funcionalidades"],
              ["Preços", "#precos"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: "13px",
                  color: T.neutral400,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.accent)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = T.neutral400)
                }
              >
                {label}
              </a>
            ))}
          </div>
          <Link
            href="/login"
            style={{
              fontSize: "13px",
              color: T.neutral400,
              textDecoration: "none",
            }}
          >
            Entrar
          </Link>
          <Link
            href="/register"
            style={{
              background: "transparent",
              color: T.accent,
              border: `1px solid ${T.accent}`,
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "rgba(145,132,217,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Criar conta grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "80px 32px 64px",
          maxWidth: "720px",
          margin: "0 auto",
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            color: T.accent,
            borderRadius: "20px",
            padding: "5px 14px",
            fontSize: "12px",
            fontWeight: 500,
            border: `1px solid ${T.accent}`,
            marginBottom: "24px",
          }}
        >
          <Check size={12} strokeWidth={2.5} /> Sem planilha, sem papel
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: "18px",
          }}
        >
          Controle suas vendas
          <br />
          <span style={{ color: T.neutral500 }}>com clareza total</span>
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: T.neutral400,
            lineHeight: 1.7,
            maxWidth: "440px",
            margin: "0 auto 32px",
          }}
        >
          Cadastre produtos, registre vendas e acompanhe seu lucro real. Feito
          para pequenos negócios que querem crescer com organização.
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "56px",
          }}
        >
          <Link
            href="/register"
            style={{
              background: "transparent",
              color: T.accent,
              border: `1px solid ${T.accent}`,
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "rgba(145,132,217,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Começar grátis por 14 dias
          </Link>
          <a
            href="#funcionalidades"
            style={{
              background: "transparent",
              color: T.text,
              border: `1px solid ${T.divider}`,
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(233,233,237,0.07)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Ver funcionalidades
          </a>
        </div>

        {/* Dashboard preview */}
        <div
          style={{
            background: T.surface,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: T.shadowMd,
            textAlign: "left",
          }}
        >
          <div
            style={{
              background: T.neutral900,
              borderBottom: `1px solid ${T.divider}`,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
            <span
              style={{
                fontSize: "11px",
                color: T.neutral600,
                marginLeft: "8px",
                fontFamily: "monospace",
              }}
            >
              app.vendafacil.com.br/dashboard
            </span>
          </div>
          <div style={{ padding: "16px", background: T.bg }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {heroKpis.map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: T.surface,
                    boxShadow: T.shadowSm,
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: T.neutral500,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 500,
                      color: m.accent ? T.accent300 : T.text,
                    }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: T.surface,
                boxShadow: T.shadowSm,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 2fr 1fr 1fr",
                  padding: "7px 12px",
                  background: T.neutral900,
                  borderBottom: `1px solid ${T.divider}`,
                }}
              >
                {["Data", "Cliente", "Total", "Lucro"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: "9px",
                      color: T.neutral500,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {tableRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 2fr 1fr 1fr",
                    padding: "7px 12px",
                    borderBottom:
                      i < tableRows.length - 1
                        ? `1px solid ${T.neutral900}`
                        : "none",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: T.neutral400,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.date}
                  </span>
                  <span style={{ fontSize: "11px", color: T.neutral300 }}>
                    {row.client}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: T.text,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.total}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: T.accent300,
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.profit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funcionalidades"
        style={{ padding: "80px 32px", maxWidth: "900px", margin: "0 auto" }}
      >
        <div
          style={{
            fontSize: "11px",
            color: T.neutral500,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "8px",
          }}
        >
          Funcionalidades
        </div>
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 500,
            letterSpacing: "-0.8px",
            marginBottom: "48px",
          }}
        >
          Tudo que você precisa,
          <br />
          nada que não precisa
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                borderRadius: "8px",
                padding: "22px",
                background: T.surface,
                boxShadow: T.shadowSm,
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px ${T.accent}`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = T.shadowSm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ color: T.accent, marginBottom: "12px" }}>
                <f.icon size={22} strokeWidth={1.75} />
              </div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: T.neutral400,
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="precos"
        style={{ padding: "80px 32px", background: T.neutral900 }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "11px",
              color: T.neutral500,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Planos
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "40px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 500,
                letterSpacing: "-0.8px",
              }}
            >
              Simples como o seu
              <br />
              negócio merece
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "inline-flex",
                  border: `1px solid ${T.divider}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {[
                  { label: "Mensal", val: false },
                  { label: "Anual", val: true },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setAnnual(opt.val)}
                    style={{
                      appearance: "none",
                      background: "transparent",
                      border: "none",
                      borderLeft:
                        opt.val === true ? `1px solid ${T.divider}` : "none",
                      padding: "7px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: annual === opt.val ? T.accent : T.neutral400,
                      boxShadow:
                        annual === opt.val ? `inset 0 0 0 1px ${T.accent}` : "none",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {annual && (
                <span
                  style={{
                    fontSize: "11px",
                    background: T.accent800,
                    color: T.accent100,
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontWeight: 500,
                  }}
                >
                  2 meses grátis
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {plans.map((plan, i) => (
              <div
                key={i}
                style={{
                  background: T.surface,
                  boxShadow: plan.featured
                    ? `0 0 0 2px ${T.accent}`
                    : T.shadowSm,
                  borderRadius: "14px",
                  padding: "24px",
                  position: "relative",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-3px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {plan.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: T.accent800,
                      color: T.accent100,
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "4px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    Mais popular
                  </div>
                )}
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    marginBottom: "4px",
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: T.neutral500,
                    marginBottom: "20px",
                  }}
                >
                  {plan.desc}
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 500,
                    letterSpacing: "-1px",
                    marginBottom: "2px",
                  }}
                >
                  R$ {annual ? plan.annual : plan.price}
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: T.neutral500,
                    }}
                  >
                    {annual ? "/ano" : "/mês"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: T.neutral600,
                    marginBottom: "20px",
                    minHeight: "16px",
                  }}
                >
                  {annual ? `equivale a R$ ${plan.price}/mês` : ""}
                </div>
                <Link
                  href="/register"
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                    background: "transparent",
                    color: plan.featured ? T.accent : T.text,
                    border: `1px solid ${plan.featured ? T.accent : T.divider}`,
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = plan.featured
                      ? "rgba(145,132,217,0.12)"
                      : "rgba(233,233,237,0.07)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Assinar {plan.name}
                </Link>
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {plan.items.map((item, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: T.neutral300,
                      }}
                    >
                      <Check size={14} color={T.accent300} strokeWidth={2.5} />{" "}
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 32px",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 500,
            letterSpacing: "-1px",
            marginBottom: "12px",
          }}
        >
          Comece hoje,
          <br />
          sem cartão de crédito
        </h2>
        <p style={{ fontSize: "15px", color: T.neutral400, marginBottom: "28px" }}>
          14 dias grátis no plano Pro. Cancele quando quiser.
        </p>
        <Link
          href="/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            color: T.accent,
            border: `1px solid ${T.accent}`,
            borderRadius: "8px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(145,132,217,0.12)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Criar minha conta grátis <ArrowRight size={15} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${T.divider}`,
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: T.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              border: `1px solid ${T.accent}`,
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
            }}
          >
            <ShoppingCart size={12} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Venda Fácil</span>
        </div>
        <span style={{ fontSize: "12px", color: T.neutral600 }}>
          © 2026 · Termos de uso · Privacidade
        </span>
      </footer>
    </main>
  );
}
