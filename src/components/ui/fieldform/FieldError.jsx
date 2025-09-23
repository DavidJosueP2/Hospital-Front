export default function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
}
