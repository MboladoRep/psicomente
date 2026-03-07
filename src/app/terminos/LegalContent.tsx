'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface LegalContentProps {
  type: 'terminos' | 'privacidad';
}

export default function LegalContent({ type }: LegalContentProps) {
  const isTerminos = type === 'terminos';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            {isTerminos ? (
              <FileText className="h-8 w-8 text-primary" />
            ) : (
              <Shield className="h-8 w-8 text-primary" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold">
              {isTerminos ? 'Términos y Condiciones' : 'Política de Privacidad'}
            </h1>
          </div>
          
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {isTerminos ? <TerminosContent /> : <PrivacidadContent />}
        </div>
      </div>
    </div>
  );
}

function TerminosContent() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          1. Aceptación de los Términos
        </h2>
        <p className="text-muted-foreground mb-4">
          Al acceder y utilizar PsicoMente (en adelante, "la Plataforma"), usted acepta estar sujeto a estos 
          Términos y Condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no deberá 
          utilizar nuestros servicios. Estos términos constituyen un acuerdo legal vinculante entre usted y 
          PsicoMente, regulando el uso de nuestra plataforma de bienestar psicológico y todos los servicios 
          relacionados que ofrecemos a través de ella.
        </p>
        <p className="text-muted-foreground">
          Le recomendamos que lea atentamente estos términos antes de registrarse o utilizar cualquiera de 
          nuestros servicios. Nos reservamos el derecho de modificar estos términos en cualquier momento, 
          y las modificaciones serán efectivas inmediatamente después de su publicación en la plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
        <p className="text-muted-foreground mb-4">
          PsicoMente es una plataforma digital de apoyo psicológico y bienestar mental que ofrece a los usuarios 
          herramientas de autoconocimiento, educación y crecimiento personal. Nuestros servicios incluyen:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Chat de apoyo psicológico:</strong> Conversaciones con inteligencia artificial diseñada para ofrecer orientación y apoyo emocional, no para reemplazar terapia profesional.</li>
          <li><strong>Diario emocional:</strong> Herramienta de registro y seguimiento de estados emocionales personales.</li>
          <li><strong>Artículos y recursos educativos:</strong> Contenido informativo sobre psicología y bienestar mental.</li>
          <li><strong>Ejercicios de mindfulness:</strong> Guías y prácticas para la atención plena y reducción del estrés.</li>
          <li><strong>Tests psicológicos:</strong> Cuestionarios de autoevaluación con fines educativos y de autoconocimiento.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          3. Aviso Importante sobre Salud Mental
        </h2>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-4">
          <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">
            ⚠️ AVISO FUNDAMENTAL - LEA ATENTAMENTE
          </p>
          <p className="text-muted-foreground">
            PsicoMente <strong>NO es un servicio de atención psicológica profesional</strong>, ni sustituye el 
            diagnóstico, tratamiento o consejo de un profesional de la salud mental licenciado. Los servicios 
            ofrecidos tienen carácter educativo y de apoyo general, y no deben considerarse como atención 
            médica, psicológica o psiquiátrica profesional.
          </p>
        </div>
        <p className="text-muted-foreground mb-4">
          Si usted está experimentando una crisis de salud mental, pensamientos de autolesión, ideación suicida, 
          o cualquier situación que requiera atención inmediata, debe contactar de inmediato con los servicios 
          de emergencia de su localidad (112 en España, 911 en otros países) o acudir al centro de salud u 
          hospital más cercano.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Registro y Cuenta de Usuario</h2>
        <p className="text-muted-foreground mb-4">
          Para acceder a ciertas funcionalidades de la Plataforma, será necesario registrarse y crear una 
          cuenta de usuario. Al hacerlo, usted se compromete a:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Proporcionar información veraz, exacta y completa durante el proceso de registro.</li>
          <li>Mantener la confidencialidad de sus credenciales de acceso (contraseña).</li>
          <li>Aceptar toda la actividad que se realice bajo su cuenta.</li>
          <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta.</li>
          <li>Tener al menos 18 años de edad, o contar con autorización parental o tutor legal si es menor.</li>
        </ul>
        <p className="text-muted-foreground">
          Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos, proporcionen 
          información falsa, o sean utilizadas de manera fraudulenta o abusiva.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          5. Suscripción Premium y Pagos
        </h2>
        <p className="text-muted-foreground mb-4">
          PsicoMente ofrece tanto servicios gratuitos como de pago (Premium). Al suscribirse a un plan de pago:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Precios:</strong> Los precios se muestran en euros (€) e incluyen los impuestos aplicables. Los precios pueden modificarse con previo aviso de al menos 30 días.</li>
          <li><strong>Renovación automática:</strong> Las suscripciones se renuevan automáticamente al final de cada período de facturación, salvo que se cancele antes de la fecha de renovación.</li>
          <li><strong>Cancelación:</strong> Puede cancelar su suscripción en cualquier momento desde su cuenta o contactando con soporte. La cancelación surtirá efecto al final del período de facturación actual.</li>
          <li><strong>Reembolsos:</strong> No se ofrecen reembolsos por períodos parcialmente utilizados, salvo en casos excepcionales determinados por PsicoMente.</li>
          <li><strong>Métodos de pago:</strong> Aceptamos pagos a través de Stripe, procesando tarjetas de crédito/débito de forma segura.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">6. Propiedad Intelectual</h2>
        <p className="text-muted-foreground mb-4">
          Todo el contenido de la Plataforma, incluyendo pero no limitado a textos, gráficos, logotipos, 
          iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de 
          PsicoMente o de sus licenciantes y está protegido por las leyes de propiedad intelectual españolas 
          e internacionales.
        </p>
        <p className="text-muted-foreground">
          Queda prohibida la reproducción, distribución, modificación, exhibición pública, o cualquier otro 
          uso del contenido sin autorización previa por escrito de PsicoMente. El uso permitido se limita 
          al acceso y disfrute personal de los servicios ofrecidos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">7. Conducta del Usuario</h2>
        <p className="text-muted-foreground mb-4">
          Al utilizar PsicoMente, usted se compromete a no realizar ninguna de las siguientes actividades:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Utilizar la plataforma para fines ilegales o no autorizados.</li>
          <li>Intentar acceder a sistemas o cuentas de otros usuarios.</li>
          <li>Transmitir virus, malware o cualquier código malicioso.</li>
          <li>Recopilar información personal de otros usuarios sin su consentimiento.</li>
          <li>Utilizar el chat para acosar, amenazar o intimidar a otros usuarios.</li>
          <li>Reproducir, vender o explotar comercialmente cualquier parte del servicio.</li>
          <li>Eludir medidas de seguridad o intentar probar vulnerabilidades del sistema.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">8. Limitación de Responsabilidad</h2>
        <p className="text-muted-foreground mb-4">
          PsicoMente, sus directores, empleados, socios, agentes, proveedores o afiliados, no serán 
          responsables de:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Cualquier daño directo o indirecto derivado del uso o imposibilidad de uso de la Plataforma.</li>
          <li>Decisiones tomadas basándose en el contenido o consejos proporcionados por la plataforma.</li>
          <li>Resultados de seguir cualquier consejo o información proporcionada por el chat de IA.</li>
          <li>Interrupciones del servicio por causas de fuerza mayor o mantenimientos programados.</li>
          <li>Contenido de terceros enlazado desde la Plataforma.</li>
        </ul>
        <p className="text-muted-foreground">
          En la máxima medida permitida por la ley, la responsabilidad total de PsicoMente hacia cualquier 
          usuario no excederá la cantidad pagada por dicho usuario durante los últimos 12 meses de suscripción.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">9. Terminación</h2>
        <p className="text-muted-foreground mb-4">
          Tanto usted como PsicoMente pueden terminar este acuerdo en cualquier momento. Nos reservamos el 
          derecho de suspender o terminar su acceso a la Plataforma sin previo aviso en caso de:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Violación de estos Términos y Condiciones.</li>
          <li>Conducta fraudulenta o abusiva.</li>
          <li>Solicitud de autoridades gubernamentales competentes.</li>
          <li>Cese de operaciones de la Plataforma.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">10. Legislación Aplicable y Jurisdicción</h2>
        <p className="text-muted-foreground">
          Estos Términos y Condiciones se rigen por la legislación española. Para la resolución de cualquier 
          controversia derivada de estos términos, las partes se someten a los Juzgados y Tribunales del 
          domicilio del usuario consumidor o, en su caso, de acuerdo con la normativa aplicable en materia 
          de consumo.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
        <p className="text-muted-foreground">
          Para cualquier pregunta sobre estos Términos y Condiciones, puede contactarnos en:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <p className="text-muted-foreground">
            <strong>Email:</strong> soporte@psicomente.com<br />
            <strong>Sitio web:</strong> https://psicomente.vercel.app
          </p>
        </div>
      </section>
    </div>
  );
}

function PrivacidadContent() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          1. Responsable del Tratamiento
        </h2>
        <p className="text-muted-foreground mb-4">
          PsicoMente es el responsable del tratamiento de los datos personales recabados a través de esta 
          plataforma. Nos comprometemos a tratar sus datos de conformidad con el Reglamento (UE) 2016/679 
          (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía 
          de los derechos digitales (LOPDGDD).
        </p>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground">
            <strong>Nombre comercial:</strong> PsicoMente<br />
            <strong>Email de contacto:</strong> soporte@psicomente.com<br />
            <strong>Sitio web:</strong> https://psicomente.vercel.app
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Datos que Recopilamos</h2>
        <p className="text-muted-foreground mb-4">
          Recopilamos diferentes tipos de datos personales con las siguientes finalidades:
        </p>
        
        <h3 className="text-xl font-semibold mb-3">2.1 Datos de Registro</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Nombre:</strong> Para personalizar su experiencia en la plataforma.</li>
          <li><strong>Email:</strong> Para identificación, comunicación y recuperación de cuenta.</li>
          <li><strong>Foto de perfil:</strong> (opcional) Para personalización de su cuenta.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.2 Datos de Uso</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Entradas del diario emocional:</strong> Registros de su estado emocional y notas personales.</li>
          <li><strong>Historial de chat:</strong> Conversaciones mantenidas con el asistente de IA.</li>
          <li><strong>Progreso y gamificación:</strong> Puntos, nivel, racha de actividad.</li>
          <li><strong>Preferencias:</strong> Configuraciones de la cuenta y preferencias de usuario.</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">2.3 Datos de Pago</h3>
        <p className="text-muted-foreground mb-4">
          Los datos de pago (número de tarjeta, etc.) son procesados exclusivamente por Stripe, nuestro 
          proveedor de pagos certificado PCI-DSS. PsicoMente <strong>no almacena datos bancarios</strong> 
          en sus servidores. Stripe nos proporciona únicamente información sobre el estado de la suscripción.
        </p>

        <h3 className="text-xl font-semibold mb-3">2.4 Datos Técnicos</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Dirección IP:</strong> Para seguridad y prevención de fraudes.</li>
          <li><strong>Información del dispositivo:</strong> Tipo de navegador, sistema operativo.</li>
          <li><strong>Cookies:</strong> Según se describe en nuestra Política de Cookies.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Finalidad del Tratamiento</h2>
        <p className="text-muted-foreground mb-4">
          Tratamos sus datos personales con las siguientes finalidades:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Prestación del servicio:</strong> Gestionar su cuenta y proporcionar acceso a todas las funcionalidades de la plataforma.</li>
          <li><strong>Personalización:</strong> Adaptar la experiencia de usuario según sus preferencias y uso.</li>
          <li><strong>Comunicación:</strong> Enviar notificaciones sobre el servicio, actualizaciones y, si ha dado su consentimiento, comunicaciones comerciales.</li>
          <li><strong>Mejora del servicio:</strong> Analizar el uso de la plataforma para mejorar nuestros servicios.</li>
          <li><strong>Seguridad:</strong> Prevenir fraudes, abusos y proteger la integridad de la plataforma.</li>
          <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y responder a solicitudes de autoridades competentes.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4. Base Legal para el Tratamiento</h2>
        <p className="text-muted-foreground mb-4">
          El tratamiento de sus datos personales se basa en las siguientes bases legales:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong>Ejecución del contrato:</strong> Para la prestación de los servicios contratados.</li>
          <li><strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales y ciertas funcionalidades específicas.</li>
          <li><strong>Interés legítimo:</strong> Para la mejora de servicios, seguridad y prevención de fraudes.</li>
          <li><strong>Cumplimiento legal:</strong> Para atender obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">5. Conservación de los Datos</h2>
        <p className="text-muted-foreground mb-4">
          Sus datos personales se conservarán durante el tiempo necesario para cumplir con las finalidades 
          para las que fueron recabados:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa, y hasta 3 años después de su última actividad.</li>
          <li><strong>Datos de facturación:</strong> Durante el tiempo exigido por la legislación fiscal (hasta 6 años).</li>
          <li><strong>Historial de uso:</strong> Mientras la cuenta esté activa, y hasta 1 año después de su cierre.</li>
          <li><strong>Datos de seguridad:</strong> Hasta 1 año desde la última interacción.</li>
        </ul>
        <p className="text-muted-foreground mt-4">
          Transcurridos estos plazos, los datos serán eliminados o anonimizados para su uso estadístico.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">6. Destinatarios de los Datos</h2>
        <p className="text-muted-foreground mb-4">
          No vendemos ni alquilamos sus datos personales a terceros. Sus datos pueden ser compartidos con:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Proveedores de servicios:</strong> Firebase (autenticación), Supabase (base de datos), Stripe (pagos), Groq (IA) - todos bajo acuerdos de confidencialidad y cumpliendo con el RGPD.</li>
          <li><strong>Autoridades:</strong> Cuando sea requerido por ley o para proteger nuestros derechos.</li>
        </ul>
        <p className="text-muted-foreground">
          Estos proveedores actúan como encargados del tratamiento y están obligados a proteger sus datos 
          de acuerdo con nuestras instrucciones y la legislación aplicable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">7. Transferencias Internacionales</h2>
        <p className="text-muted-foreground">
          Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico 
          Europeo. En estos casos, nos aseguramos de que existan garantías adecuadas, como decisiones de 
          adecuación de la Comisión Europea o Cláusulas Contractuales Tipo, para proteger sus datos 
          conforme al RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">8. Sus Derechos</h2>
        <p className="text-muted-foreground mb-4">
          Como usuario, tiene los siguientes derechos respecto a sus datos personales:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong>Acceso:</strong> Conocer qué datos personales tratamos sobre usted.</li>
          <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos personales ("derecho al olvido").</li>
          <li><strong>Limitación:</strong> Solicitar que restrinjamos el tratamiento de sus datos.</li>
          <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado para transferirlos a otro servicio.</li>
          <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en ciertas circunstancias.</li>
          <li><strong>Retirar consentimiento:</strong> Retirar su consentimiento en cualquier momento para tratamientos basados en el mismo.</li>
        </ul>
        <p className="text-muted-foreground">
          Para ejercer estos derechos, puede contactarnos en soporte@psicomente.com. Responderemos a su 
          solicitud en el plazo máximo de un mes. También tiene derecho a presentar una reclamación ante 
          la Agencia Española de Protección de Datos (AEPD).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">9. Seguridad</h2>
        <p className="text-muted-foreground">
          Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
          contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen 
          cifrado de datos en tránsito (HTTPS), autenticación segura, y controles de acceso a los sistemas. 
          Sin embargo, ningún sistema es 100% seguro, y no podemos garantizar la seguridad absoluta de 
          los datos transmitidos a través de Internet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">10. Cookies</h2>
        <p className="text-muted-foreground">
          Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso de la 
          plataforma y personalizar contenido. Puede configurar su navegador para rechazar cookies, 
          aunque esto puede afectar el funcionamiento de ciertas funcionalidades. Para más información, 
          consulte nuestra Política de Cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">11. Menores de Edad</h2>
        <p className="text-muted-foreground">
          Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos deliberadamente 
          datos personales de menores. Si tenemos conocimiento de que hemos recopilado datos de un menor, 
          tomaremos medidas para eliminar dicha información.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">12. Cambios en la Política de Privacidad</h2>
        <p className="text-muted-foreground">
          Podemos actualizar esta Política de Privacidad periódicamente. Las modificaciones serán 
          publicadas en esta página con la fecha de actualización. Le recomendamos revisar esta política 
          regularmente para estar informado sobre cómo protegemos sus datos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">13. Contacto</h2>
        <p className="text-muted-foreground mb-4">
          Para cualquier cuestión relacionada con esta Política de Privacidad o el tratamiento de sus 
          datos personales, puede contactarnos en:
        </p>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-muted-foreground">
            <strong>Email:</strong> soporte@psicomente.com<br />
            <strong>Sitio web:</strong> https://psicomente.vercel.app
          </p>
        </div>
      </section>
    </div>
  );
}
