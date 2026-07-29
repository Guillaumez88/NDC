import type { Palette } from '../lib/theme';

type Props = {
  dateHeure: Date;
  onChange: (d: Date) => void;
  couleurs: Palette;
};

function versDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function versTimeInput(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Implémentation web : <input type="date"/time"> natifs du navigateur, comme
// dans le prototype de référence (ce fichier .web.tsx n'est chargé que sur web).
export function ChampDateHeure({ dateHeure, onChange, couleurs: c }: Props) {
  const style: React.CSSProperties = {
    flex: 1,
    background: c.card,
    border: `1px solid ${c.line}`,
    borderRadius: 20,
    padding: '14px 16px',
    fontSize: 14,
    color: c.ink,
    outline: 'none',
    fontFamily: 'inherit',
  };

  function onChangeDate(e: React.ChangeEvent<HTMLInputElement>) {
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (!y || !m || !d) return;
    const suivant = new Date(dateHeure);
    suivant.setFullYear(y, m - 1, d);
    onChange(suivant);
  }

  function onChangeTime(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, min] = e.target.value.split(':').map(Number);
    if (h === undefined || min === undefined) return;
    const suivant = new Date(dateHeure);
    suivant.setHours(h, min);
    onChange(suivant);
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input type="date" value={versDateInput(dateHeure)} onChange={onChangeDate} style={style} />
      <input
        type="time"
        value={versTimeInput(dateHeure)}
        onChange={onChangeTime}
        style={{ ...style, flex: 'none', width: 118 }}
      />
    </div>
  );
}
