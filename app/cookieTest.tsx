"use client"; // Marks this as a Client Component

type Cookie = {
  name: string;
  value: string;
};

export default function CookiesClientComp({ cookies }: { cookies: Cookie[] }) {
  return (
    <ul>
      {cookies.map((c) => (
        <li key={c.name}>
          {c.name}: {c.value}
        </li>
      ))}
    </ul>
  );
}
