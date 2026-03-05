import { Metadata } from 'next';
import LegalContent from './LegalContent';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | PsicoMente',
  description: 'Términos y condiciones de uso de la plataforma PsicoMente.',
};

export default function TerminosPage() {
  return <LegalContent type="terminos" />;
}
