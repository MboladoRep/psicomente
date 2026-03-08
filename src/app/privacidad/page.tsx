import { Metadata } from 'next';
import LegalContent from '../terminos/LegalContent';

export const metadata: Metadata = {
  title: 'Política de Privacidad | PsicoMente',
  description: 'Política de privacidad y protección de datos de PsicoMente.',
};

export default function PrivacidadPage() {
  return <LegalContent type="privacidad" />;
}
