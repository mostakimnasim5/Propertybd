import { useState } from "react";

const GREEN = "#0E4D34";
const GREEN_MID = "#166A47";
const GREEN_LIGHT = "#E8F5EE";
const AMBER = "#F5A623";
const AMBER_LIGHT = "#FEF3DC";
const SURFACE = "#FAFAF8";
const BORDER = "#E5E2DC";
const TEXT = "#111827";
const TEXT_SEC = "#4B5563";
const TEXT_MUTED = "#9CA3AF";

const VIEWS = ["হোমপেজ", "প্রপার্টি লিস্ট", "প্রপার্টি ডিটেইল", "ড্যাশবোর্ড", "অ্যাডমিন"];

const SAMPLE_LISTINGS = [
  { id: 1, title: "গুলশান ২-তে ৩ রুমের ফার্নিশড ফ্ল্যাট", type: "ফ্ল্যাট", purpose: "RENT", price: "35,000", area: "1400", beds: 3, baths: 2, district: "ঢাকা", area_name: "গুলশান", verified: true, featured: true, emoji: "🏢" },
  { id: 2, title: "বনানীতে ২ রুমের ফ্ল্যাট বিক্রয়", type: "ফ্ল্যাট", purpose: "SALE", price: "85,00,000", area: "1100", beds: 2, baths: 2, district: "ঢাকা", area_name: "বনানী", verified: true, featured: false, emoji: "🏠" },
  { id: 3, title: "মিরপুরে জমি বিক্রয়", type: "জমি", purpose: "SALE", price: "1,20,00,000", area: "3 কাঠা", beds: null, baths: null, district: "ঢাকা", area_name: "মিরপুর", verified: false, featured: false, emoji: "🌍" },
  { id: 4, title: "চট্টগ্রামে কমার্শিয়াল স্পেস ভাড়া", type: "দোকান", purpose: "RENT", price: "45,000", area: "800", beds: null, baths: null, district: "চট্টগ্রাম", area_name: "আগ্রাবাদ", verified: true, featured: true, emoji: "🏪" },
];

function Navbar({ active }) {
  return (
    <div style={{ background: "white", borderBottom: `1px solid ${BORDER}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "0.8rem" }}>PB</div>
        <span style={{ fontWeight: 800, fontSize: "1rem", color: GREEN }}>Property<span style={{ color: AMBER }}>BD</span></span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {["প্রপার্টি", "গাড়ি", "নির্মাণ"].map(l => (
          <div key={l} style={{ padding: "5px 10px", borderRadius: 7, fontSize: "0.8rem", fontWeight: 600, color: TEXT_SEC }}>{l}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ padding: "6px 12px", borderRadius: 7, background: GREEN, color: "white", fontWeight: 700, fontSize: "0.78rem" }}>+ বিজ্ঞাপন</div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>N</div>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  return (
    <div style={{ background: "white", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ background: "linear-gradient(135deg, #e8f5ee, #d1e8da)", paddingTop: "58%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>{listing.emoji}</div>
        {listing.featured && <div style={{ position: "absolute", top: 8, left: 8, background: AMBER_LIGHT, color: "#92400E", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>⭐ ফিচার্ড</div>}
        <div style={{ position: "absolute", top: 8, right: 8, background: listing.purpose === "RENT" ? "#1D4ED8" : GREEN, color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>
          {listing.purpose === "RENT" ? "ভাড়া" : "বিক্রয়"}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>{listing.type}</span>
          {listing.verified && <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>✓ যাচাই</span>}
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.3, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{listing.title}</div>
        <div style={{ fontSize: "0.72rem", color: TEXT_MUTED, marginBottom: 8 }}>📍 {listing.area_name}, {listing.district}</div>
        {listing.beds && (
          <div style={{ display: "flex", gap: 8, fontSize: "0.72rem", color: TEXT_SEC, marginBottom: 8 }}>
            <span>🛏 {listing.beds}</span><span>🚿 {listing.baths}</span><span>📐 {listing.area} বর্গফুট</span>
          </div>
        )}
        <div style={{ fontSize: "1rem", fontWeight: 800, color: GREEN }}>৳ {listing.price}{listing.purpose === "RENT" ? <span style={{ fontSize: "0.7rem", fontWeight: 400, color: TEXT_MUTED }}>/মাস</span> : ""}</div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0E4D34 0%, #1a6b47 60%)", padding: "48px 20px 60px", textAlign: "center" }}>
        <div style={{ fontSize: "0.72rem", color: AMBER, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>বাংলাদেশের সেরা মার্কেটপ্লেস</div>
        <h1 style={{ color: "white", fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.25, marginBottom: 10 }}>
          আপনার স্বপ্নের সম্পদ<br /><span style={{ color: AMBER }}>এখানেই খুঁজুন</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", marginBottom: 24 }}>সারা বাংলাদেশে ফ্ল্যাট, বাড়ি, জমি, গাড়ি কেনা-বেচা ও ভাড়া</p>

        {/* Search box */}
        <div style={{ background: "white", borderRadius: 14, padding: 18, maxWidth: 680, margin: "0 auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, borderBottom: `2px solid ${BORDER}`, paddingBottom: 12 }}>
            {[{ id: "property", label: "প্রপার্টি", icon: "🏠" }, { id: "vehicle", label: "গাড়ি", icon: "🚗" }, { id: "construction", label: "নির্মাণ", icon: "🏗️" }].map((cat, i) => (
              <div key={cat.id} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, background: i === 0 ? GREEN_LIGHT : "transparent", color: i === 0 ? GREEN : TEXT_SEC, fontWeight: i === 0 ? 700 : 500, fontSize: "0.82rem", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: "1.1rem" }}>{cat.icon}</div>
                <div>{cat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["বিভাগ ▾", "জেলা ▾", "এলাকা / কীওয়ার্ড..."].map((p, i) => (
              <div key={i} style={{ flex: i === 2 ? 2 : 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: "0.82rem", color: TEXT_MUTED, background: "white" }}>{p}</div>
            ))}
            <div style={{ background: GREEN, color: "white", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap", cursor: "pointer" }}>🔍 খুঁজুন</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "white", borderBottom: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "16px 20px", gap: 8 }}>
        {[["৫০,০০০+", "সক্রিয় বিজ্ঞাপন"], ["৬৪", "জেলায় সেবা"], ["১০,০০০+", "সন্তুষ্ট গ্রাহক"], ["৯৮%", "যাচাইকৃত"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: GREEN }}>{v}</div>
            <div style={{ fontSize: "0.7rem", color: TEXT_SEC }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div style={{ padding: "24px 20px", background: SURFACE }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>সাম্প্রতিক প্রপার্টি</div>
            <div style={{ fontSize: "0.78rem", color: TEXT_SEC }}>নতুন যোগ হওয়া বিজ্ঞাপন</div>
          </div>
          <div style={{ fontSize: "0.82rem", color: GREEN, fontWeight: 700 }}>সব দেখুন →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {SAMPLE_LISTINGS.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: AMBER_LIGHT, padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, color: GREEN, marginBottom: 4 }}>সম্পদ বিক্রি বা ভাড়া দিতে চান?</div>
          <div style={{ fontSize: "0.82rem", color: TEXT_SEC }}>বিনামূল্যে বিজ্ঞাপন দিন</div>
        </div>
        <div style={{ background: GREEN, color: "white", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>+ বিজ্ঞাপন দিন</div>
      </div>
    </div>
  );
}

function PropertyListPage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: 16, background: SURFACE, minHeight: 400 }}>
      {/* Sidebar */}
      <div style={{ background: "white", borderRadius: 10, border: `1px solid ${BORDER}`, padding: 14 }}>
        <div style={{ fontWeight: 700, color: GREEN, marginBottom: 12, fontSize: "0.88rem" }}>🔧 ফিল্টার</div>
        {[["উদ্দেশ্য", ["সব", "বিক্রি", "ভাড়া"]], ["ধরন", ["সব ধরন", "ফ্ল্যাট", "বাড়ি", "জমি"]], ["বিভাগ", ["সব বিভাগ", "ঢাকা", "চট্টগ্রাম"]], ["জেলা", ["সব জেলা"]]].map(([label, opts]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: "0.75rem", marginBottom: 5 }}>{label}</div>
            {label === "উদ্দেশ্য" ? (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(opts as string[]).map((o, i) => (
                  <div key={o} style={{ padding: "3px 10px", borderRadius: 99, border: `1.5px solid ${i === 0 ? GREEN : BORDER}`, background: i === 0 ? GREEN : "white", color: i === 0 ? "white" : TEXT_SEC, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>{o}</div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "6px 10px", borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: "0.78rem", color: TEXT_SEC, background: "white" }}>{(opts as string[])[0]} ▾</div>
            )}
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: "0.75rem", marginBottom: 5 }}>দাম (টাকা)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ padding: "6px 8px", borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: "0.75rem", color: TEXT_MUTED }}>সর্বনিম্ন</div>
            <div style={{ padding: "6px 8px", borderRadius: 7, border: `1.5px solid ${BORDER}`, fontSize: "0.75rem", color: TEXT_MUTED }}>সর্বোচ্চ</div>
          </div>
        </div>
        <div style={{ padding: "8px", borderRadius: 7, border: `2px solid ${GREEN}`, color: GREEN, fontWeight: 700, fontSize: "0.78rem", textAlign: "center", cursor: "pointer" }}>ফিল্টার রিসেট</div>
      </div>

      {/* Listings */}
      <div>
        <div style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "white", fontSize: "0.85rem", color: TEXT_MUTED, marginBottom: 12 }}>🔍 এলাকা বা কীওয়ার্ড দিয়ে খুঁজুন...</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {SAMPLE_LISTINGS.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>
    </div>
  );
}

function PropertyDetailPage() {
  const listing = SAMPLE_LISTINGS[0];
  const [unlocked, setUnlocked] = useState(false);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, padding: 16, background: SURFACE }}>
      <div>
        <div style={{ background: "linear-gradient(135deg, #e8f5ee, #d1e8da)", borderRadius: 12, paddingTop: "50%", position: "relative", marginBottom: 10 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>🏢</div>
          <div style={{ position: "absolute", top: 10, left: 10, background: AMBER_LIGHT, color: "#92400E", fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>⭐ ফিচার্ড</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>ফ্ল্যাট</span>
          <span style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>ভাড়া</span>
          <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>✓ যাচাইকৃত</span>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 6 }}>{listing.title}</h2>
        <div style={{ fontSize: "0.78rem", color: TEXT_MUTED, marginBottom: 14 }}>📍 {listing.area_name}, {listing.district} • 👁️ ২৩৪ বার দেখা হয়েছে</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          {[["📐", "আয়তন", "১৪০০ বর্গফুট"], ["🛏️", "বেডরুম", "৩টি"], ["🚿", "বাথরুম", "২টি"], ["🏢", "ফ্লোর", "৫/১০"], ["🛋️", "ফার্নিচার", "ফার্নিশড"], ["🚗", "পার্কিং", "আছে"]].map(([icon, label, val]) => (
            <div key={label} style={{ background: GREEN_LIGHT, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: "1rem", marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: "0.68rem", color: TEXT_SEC }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", color: GREEN }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: 10, border: `1px solid ${BORDER}`, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.88rem" }}>বিবরণ</div>
          <p style={{ color: TEXT_SEC, lineHeight: 1.8, fontSize: "0.82rem" }}>গুলশান ২-তে অবস্থিত একটি সুন্দর ও আধুনিক ফার্নিশড ফ্ল্যাট। সব ধরনের সুযোগ সুবিধা সম্পন্ন। নিরাপদ এলাকায় অবস্থিত।</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ padding: "7px 14px", borderRadius: 7, background: "#1877F2", color: "white", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>📘 শেয়ার</div>
          <div style={{ padding: "7px 14px", borderRadius: 7, background: "#25D366", color: "white", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>💬 WhatsApp</div>
        </div>
      </div>

      {/* Contact card */}
      <div style={{ position: "sticky", top: 10 }}>
        <div style={{ background: "white", borderRadius: 12, border: `1px solid ${BORDER}`, padding: 16 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: GREEN, marginBottom: 2 }}>৳ ৩৫,০০০</div>
          <div style={{ fontSize: "0.72rem", color: TEXT_MUTED, marginBottom: 12 }}>প্রতি মাসে • আলোচনাসাপেক্ষ</div>
          <div style={{ height: 1, background: BORDER, marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>ম</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>মালিক</div>
              <span style={{ background: GREEN_LIGHT, color: GREEN, fontSize: "0.62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>✓ NID যাচাই</span>
            </div>
          </div>
          {!unlocked ? (
            <>
              <div style={{ background: AMBER_LIGHT, borderRadius: 8, padding: 9, marginBottom: 8, fontSize: "0.75rem", color: "#92400E" }}>🔒 নম্বর দেখতে মাত্র ৳২০ দিন</div>
              <div onClick={() => setUnlocked(true)} style={{ background: GREEN, color: "white", padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", textAlign: "center", cursor: "pointer", marginBottom: 8 }}>🔓 নম্বর দেখুন — ৳২০</div>
            </>
          ) : (
            <>
              <div style={{ background: GREEN_LIGHT, borderRadius: 8, padding: 12, textAlign: "center", marginBottom: 8 }}>
                <div style={{ fontSize: "0.68rem", color: TEXT_SEC, marginBottom: 2 }}>মালিকের নম্বর</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: GREEN }}>📞 017XXXXXXXX</div>
              </div>
              <div style={{ background: GREEN, color: "white", padding: "9px", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", textAlign: "center", cursor: "pointer", marginBottom: 8 }}>📞 কল করুন</div>
              <div style={{ background: "#25D366", color: "white", padding: "9px", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", textAlign: "center", cursor: "pointer", marginBottom: 8 }}>💬 WhatsApp করুন</div>
            </>
          )}
          <div style={{ border: `2px solid ${GREEN}`, color: GREEN, padding: "9px", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", textAlign: "center", cursor: "pointer" }}>🤍 সংরক্ষণ করুন</div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: 16, background: SURFACE, minHeight: 400 }}>
      <div style={{ background: "white", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ background: GREEN, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>ন</div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>নাসিম</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>01712345678</div>
          <div style={{ marginTop: 6, display: "inline-block", background: AMBER, color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>সদস্য</div>
        </div>
        {[["📊 আমার বিজ্ঞাপন", true], ["❤️ সংরক্ষিত", false], ["+ নতুন বিজ্ঞাপন", false]].map(([label, active]) => (
          <div key={label} style={{ padding: "11px 14px", fontWeight: 600, fontSize: "0.82rem", color: active ? GREEN : TEXT_SEC, background: active ? GREEN_LIGHT : "transparent", borderLeft: `3px solid ${active ? GREEN : "transparent"}`, borderBottom: `1px solid ${BORDER}` }}>{label}</div>
        ))}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: GREEN }}>আমার বিজ্ঞাপন</div>
          <div style={{ background: GREEN, color: "white", padding: "7px 14px", borderRadius: 7, fontSize: "0.78rem", fontWeight: 700 }}>+ নতুন</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: `2px solid ${BORDER}`, paddingBottom: 0 }}>
          {["🏠 প্রপার্টি", "🚗 গাড়ি", "🏗️ নির্মাণ"].map((t, i) => (
            <div key={t} style={{ padding: "8px 14px", fontWeight: 700, fontSize: "0.8rem", color: i === 0 ? GREEN : TEXT_SEC, borderBottom: `2px solid ${i === 0 ? GREEN : "transparent"}`, marginBottom: -2, cursor: "pointer" }}>{t}</div>
          ))}
        </div>
        {[
          { title: "গুলশানে ফ্ল্যাট ভাড়া", status: "সক্রিয়", color: "#166A47", bg: "#D1FAE5", district: "ঢাকা", emoji: "🏢" },
          { title: "বনানীতে ফ্ল্যাট বিক্রয়", status: "অপেক্ষমাণ", color: "#D97706", bg: "#FEF3C7", district: "ঢাকা", emoji: "🏠" },
          { title: "মিরপুরে জমি বিক্রয়", status: "বাতিল", color: "#DC2626", bg: "#FEE2E2", district: "ঢাকা", emoji: "🌍" },
        ].map(item => (
          <div key={item.title} style={{ background: "white", borderRadius: 8, border: `1px solid ${BORDER}`, padding: 12, display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 52, height: 40, borderRadius: 6, background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.title}</div>
              <div style={{ fontSize: "0.7rem", color: TEXT_MUTED }}>📍 {item.district}</div>
            </div>
            <span style={{ background: item.bg, color: item.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPage() {
  return (
    <div style={{ display: "flex", minHeight: 400 }}>
      <div style={{ width: 160, background: GREEN, flexShrink: 0 }}>
        <div style={{ padding: "18px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontWeight: 800, color: "white", fontSize: "0.95rem" }}>Property<span style={{ color: AMBER }}>BD</span></div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}>অ্যাডমিন প্যানেল</div>
        </div>
        {[["📊 ড্যাশবোর্ড", false], ["🏠 বিজ্ঞাপন", true], ["👥 ব্যবহারকারী", false]].map(([l, a]) => (
          <div key={l} style={{ padding: "11px 14px", color: a ? "white" : "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: "0.8rem", background: a ? "rgba(255,255,255,0.12)" : "transparent", borderLeft: `3px solid ${a ? AMBER : "transparent"}` }}>{l}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 16, background: SURFACE }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 2 }}>বিজ্ঞাপন ব্যবস্থাপনা</div>
          <div style={{ fontSize: "0.75rem", color: TEXT_SEC }}>মোট: ১২টি অনুমোদন বাকি</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["🏠 প্রপার্টি", "🚗 গাড়ি", "🏗️ নির্মাণ"].map((c, i) => (
            <div key={c} style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${i === 0 ? GREEN : BORDER}`, background: i === 0 ? GREEN_LIGHT : "white", color: i === 0 ? GREEN : TEXT_SEC, fontWeight: 600, fontSize: "0.75rem" }}>{c}</div>
          ))}
          <div style={{ width: 1, background: BORDER }} />
          {["⏳ অনুমোদন বাকি", "✅ সক্রিয়", "❌ বাতিল"].map((s, i) => (
            <div key={s} style={{ padding: "5px 12px", borderRadius: 7, border: `1.5px solid ${i === 0 ? GREEN : BORDER}`, background: i === 0 ? GREEN : "white", color: i === 0 ? "white" : TEXT_SEC, fontWeight: 600, fontSize: "0.75rem" }}>{s}</div>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 100px 70px 120px", gap: 0, background: SURFACE, padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
            {["ছবি", "বিজ্ঞাপন", "মালিক", "তারিখ", "অ্যাকশন"].map(h => (
              <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: TEXT_SEC }}>{h}</div>
            ))}
          </div>
          {[
            { title: "গুলশানে ফ্ল্যাট ভাড়া", owner: "করিম সাহেব", phone: "01712...", date: "২৫/০৭/২৫", emoji: "🏢", price: "৳৩৫,০০০" },
            { title: "বনানীতে ফ্ল্যাট বিক্রয়", owner: "রহিম মিয়া", phone: "01812...", date: "২৪/০৭/২৫", emoji: "🏠", price: "৳৮৫,০০,০০০" },
          ].map(item => (
            <div key={item.title} style={{ display: "grid", gridTemplateColumns: "44px 1fr 100px 70px 120px", gap: 0, padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, alignItems: "center" }}>
              <div style={{ width: 36, height: 28, borderRadius: 5, background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{item.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{item.title}</div>
                <div style={{ fontSize: "0.68rem", color: GREEN, fontWeight: 700 }}>{item.price}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{item.owner}</div>
                <div style={{ fontSize: "0.65rem", color: TEXT_MUTED }}>{item.phone}</div>
              </div>
              <div style={{ fontSize: "0.68rem", color: TEXT_MUTED }}>{item.date}</div>
              <div style={{ display: "flex", gap: 4 }}>
                <div style={{ padding: "4px 8px", borderRadius: 5, background: GREEN, color: "white", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}>✅ অনুমোদন</div>
                <div style={{ padding: "4px 8px", borderRadius: 5, background: "#DC2626", color: "white", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}>❌</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("হোমপেজ");

  const renderView = () => {
    switch (view) {
      case "হোমপেজ": return <HomePage />;
      case "প্রপার্টি লিস্ট": return <PropertyListPage />;
      case "প্রপার্টি ডিটেইল": return <PropertyDetailPage />;
      case "ড্যাশবোর্ড": return <DashboardPage />;
      case "অ্যাডমিন": return <AdminPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', 'Segoe UI', sans-serif", maxWidth: 900, margin: "0 auto", background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      {/* Tab switcher */}
      <div style={{ background: "#1A1A2E", padding: "10px 16px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginRight: 4 }}>পেজ দেখুন:</span>
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
            background: view === v ? AMBER : "rgba(255,255,255,0.1)",
            color: view === v ? "#1A1A2E" : "rgba(255,255,255,0.75)",
            fontWeight: view === v ? 800 : 500, fontSize: "0.78rem",
            fontFamily: "inherit",
          }}>{v}</button>
        ))}
      </div>

      {/* Browser bar */}
      <div style={{ background: "#F1F3F4", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#FF5F57", "#FFBD2E", "#28CA41"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", color: TEXT_MUTED, border: `1px solid ${BORDER}` }}>
          🔒 propertybd.com/{view === "হোমপেজ" ? "" : view === "প্রপার্টি লিস্ট" ? "properties" : view === "প্রপার্টি ডিটেইল" ? "properties/abc123" : view === "ড্যাশবোর্ড" ? "dashboard" : "admin/listings"}
        </div>
      </div>

      <Navbar active={view} />
      <div style={{ maxHeight: 520, overflowY: "auto" }}>{renderView()}</div>

      {/* Role coverage info */}
      <div style={{ background: "#1A1A2E", padding: "14px 16px" }}>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>বর্তমানে কোন user-এর জন্য কী আছে:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
          {[
            { role: "🛒 ক্রেতা/ভাড়াটে", items: ["Search + Filter", "Lead Unlock", "Saved Listings", "WhatsApp/Call"], full: true },
            { role: "🏠 Property Owner", items: ["Listing Post", "Dashboard", "Approval SMS", "View Count"], full: true },
            { role: "👔 Broker", items: ["Basic listing ✅", "Subscription ❌", "Bulk listing ❌", "Broker dashboard ❌"], full: false },
            { role: "🏗️ Builder", items: ["Company profile ✅", "Project-wise listing ❌", "Floor plan ❌", "Unit management ❌"], full: false },
          ].map(r => (
            <div key={r.role} style={{ background: r.full ? "rgba(14,77,52,0.4)" : "rgba(220,38,38,0.2)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.78rem", marginBottom: 6 }}>{r.role} {r.full ? "✅" : "⚠️"}</div>
              {r.items.map(item => (
                <div key={item} style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", marginBottom: 2 }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
