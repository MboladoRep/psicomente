# 🚀 PLAN DE LANZAMIENTO - PSICOMENTE

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Conseguir los primeros 100 usuarios de pago en 90 días

**Producto:** Plataforma de bienestar psicológico con chat IA, diario emocional y recursos de autoayuda

**Modelo de negocio:** Freemium (gratis limitado + Premium 4.99€/mes)

---

## 🎯 FASE 1: PREPARACIÓN (Semana 1-2)

### ✅ Checklist Técnico

| Tarea | Estado |
|-------|--------|
| Páginas legales (Términos, Privacidad) | ✅ Creado |
| Variables de entorno configuradas | ✅ Listo |
| Seguridad implementada | ✅ Listo |
| Rate limiting | ✅ Listo |
| Sistema de pagos Stripe | ⚠️ Verificar en producción |

### 📝 Acciones Pendientes

1. **Configurar Stripe en modo LIVE**
   - [ ] Activar cuenta de Stripe (pasar verificación)
   - [ ] Cambiar claves a producción en Vercel
   - [ ] Crear webhook de producción en Stripe Dashboard
   - [ ] Probar pago real con tarjeta propia

2. **Crear email de soporte**
   - [ ] Configurar soporte@psicomente.com (o similar)
   - [ ] Añadir a las páginas legales

3. **Test final de usuario**
   - [ ] Registrar cuenta nueva desde cero
   - [ ] Probar login con Google
   - [ ] Probar chat (5 mensajes gratis)
   - [ ] Probar diario emocional
   - [ ] Probar flujo de pago (modo test)
   - [ ] Verificar que premium se activa

---

## 🧪 FASE 2: BETA CERRADA (Semana 3-4)

### Objetivo
Conseguir 20-30 usuarios beta que den feedback antes del lanzamiento público.

### Estrategia de Reclutamiento

**Dónde buscar usuarios beta:**

| Canal | Acción | Usuarios esperados |
|-------|--------|-------------------|
| Amigos y familia | Invitar personalmente | 5-10 |
| Grupos de Facebook | Buscar grupos de psicología, bienestar, desarrollo personal | 5-10 |
| LinkedIn | Post sobre la plataforma | 3-5 |
| Reddit | r/psicologia, r/meditación (con cuidado) | 3-5 |
| Twitter/X | Hilos sobre salud mental | 2-5 |

### Oferta Beta
- **3 meses Premium GRATIS** a cambio de:
  - Completar encuesta de feedback
  - Permitir usar su testimonio

### Encuesta de Feedback
```
1. ¿Qué funcionalidad te parece más útil?
2. ¿Qué mejorarías?
3. ¿Encontraste algún bug?
4. ¿Recomendarías PsicoMente? (1-10)
5. ¿Qué precio consideras justo?
6. ¿Qué funcionalidad te gustaría que añadiéramos?
```

### Métricas a Monitorizar
- Tasa de registro
- Mensajes de chat por usuario
- Entradas de diario por usuario
- Retención día 7
- NPS (Net Promoter Score)

---

## 🚀 FASE 3: LANZAMIENTO PÚBLICO (Semana 5-8)

### Preparación del Lanzamiento

**Contenido para redes:**
- [ ] 5-10 posts sobre bienestar mental
- [ ] Capturas de pantalla de la plataforma
- [ ] Video demo de 30-60 segundos
- [ ] Testimonios de usuarios beta

**Landing de lanzamiento:**
- [ ] Asegurar que el hero explica claramente el valor
- [ ] CTA claro ("Empieza gratis")
- [ ] Prueba social (testimonios, contador de usuarios)

### Estrategia de Lanzamiento

#### Semana 5: Soft Launch

**Acciones:**
1. **Product Hunt**
   - Preparar lanzamiento para un martes o miércoles
   - Crear página atractiva con vídeo
   - Conseguir 20 upvotes iniciales de contactos

2. **Reddit**
   - Post en r/SideProject
   - Comentar en hilos relacionados de r/psicologia

3. **Hacker News**
   - Post en Show HN (si hay ángulo técnico interesante)

4. **Indie Hackers**
   - Crear post sobre el proceso de desarrollo

#### Semana 6-7: Marketing de contenidos

**Contenido a crear:**

| Tipo | Cantidad | Canales |
|------|----------|---------|
| Artículos de blog | 3-5 | Web, LinkedIn |
| Hilos Twitter/X | 5-10 | Twitter |
| Posts Instagram | 5-7 | Instagram |
| Posts LinkedIn | 3-5 | LinkedIn |

**Temas sugeridos:**
- "5 técnicas de manejo del estrés que puedes practicar hoy"
- "Por qué llevar un diario emocional mejora tu bienestar"
- "Cómo la IA puede ayudarte en tu crecimiento personal"
- "La importancia de la autoconciencia emocional"
- "Ejercicios de mindfulness para principiantes"

#### Semana 8: Colaboraciones

**Estrategia:**
1. Contactar con psicólogos con presencia en redes
   - Ofrecer cuenta Premium gratis
   - Pedir reseña o mención

2. Colaborar con newsletters de bienestar
   - Ofrecer contenido de valor
   - Descuento para suscriptores

3. Podcasts de desarrollo personal
   - Ofrecerse como invitado
   - Hablar del proyecto

---

## 📈 FASE 4: ESCALADO (Mes 2-3)

### Objetivos

| Métrica | Mes 1 | Mes 2 | Mes 3 |
|---------|-------|-------|-------|
| Usuarios registrados | 100 | 300 | 500 |
| Usuarios Premium | 10 | 30 | 100 |
| MRR (ingresos mensuales) | 50€ | 150€ | 500€ |

### Estrategias de Crecimiento

#### 1. SEO
- Optimizar artículos para búsquedas
- Crear contenido evergreen
- Keywords: "ayuda psicológica online", "diario emocional", "chat psicólogo"

#### 2. Email Marketing
- Capturar emails con lead magnet (ej: "Guía gratis de autocuidado")
- Secuencia de bienvenida (3-5 emails)
- Newsletter semanal de consejos

#### 3. Referral Program
- "Invita un amigo, gana 1 mes gratis"
- Ambos usuarios reciben beneficio

#### 4. Pagos Publicitarios (si hay presupuesto)
- Facebook/Instagram Ads: 5-10€/día
- Target: Interés en psicología, meditación, bienestar
- Google Ads: Keywords de cola larga

---

## 💰 MONETIZACIÓN

### Precios Actuales
```
Gratis: 5 mensajes chat, 3 entradas diario
Premium: 4.99€/mes - Todo ilimitado
```

### Opciones a Considerar

| Plan | Precio | Incluye |
|------|--------|---------|
| Básico | Gratis | 5 chat/día, diario limitado |
| Premium | 4.99€/mes | Todo ilimitado |
| Anual | 49.99€/año | Premium + 2 meses gratis |

### Upselling
- Recordatorio de límite alcanzado
- "Desbloquea todo por 4.99€/mes"
- Trial de 7 días gratis (opcional)

---

## 📊 MÉTRICAS CLAVE (KPIs)

### Métricas de Producto
| Métrica | Fórmula | Objetivo |
|---------|---------|----------|
| Tasa de registro | Registros / Visitas | > 5% |
| Activación | Usuarios que usan chat o diario | > 60% |
| Retención D7 | Usuarios activos día 7 | > 30% |
| Conversión a Premium | Premium / Total usuarios | > 10% |

### Métricas de Negocio
| Métrica | Fórmula | Objetivo |
|---------|---------|----------|
| CAC | Gasto marketing / Nuevos clientes | < 10€ |
| LTV | 4.99€ × meses promedio | > 30€ |
| LTV/CAC | LTV / CAC | > 3 |
| Churn | Bajas / Total Premium | < 10%/mes |

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### Analytics
- **Google Analytics 4** - Tráfico web
- **Vercel Analytics** - Rendimiento
- **Mixpanel** (gratis hasta 100k eventos) - Comportamiento usuario

### Marketing
- **Mailchimp** (gratis hasta 500 contacts) - Email marketing
- **Buffer** (plan gratuito) - Programar redes sociales
- **Canva** - Crear imágenes para redes

### Soporte
- **Crisp** (gratis) - Chat de soporte en web
- **Typeform** - Encuestas de feedback

---

## ⚠️ RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Poca conversión a pago | Media | Alto | Mejorar onboarding, valor percibido |
| Costes de IA altos | Media | Medio | Rate limiting, optimizar prompts |
| Competencia | Alta | Medio | Diferenciación, comunidad |
| Problemas técnicos | Baja | Alto | Monitoreo, backups |
| Regulación sanitaria | Baja | Alto | Avisos claros, no diagnosticar |

---

## 📅 CALENDARIO RESUMIDO

| Semana | Fase | Acción Principal |
|--------|------|------------------|
| 1-2 | Preparación | Stripe LIVE, tests finales |
| 3-4 | Beta | 20-30 usuarios beta |
| 5 | Lanzamiento | Product Hunt, Reddit |
| 6-7 | Marketing | Contenido en redes |
| 8 | Colaboraciones | Contactar influencers |
| 9-12 | Escalado | SEO, Ads, Email |

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **HOY:** Verificar que Stripe funciona correctamente
2. **ESTA SEMANA:** Encontrar 10 usuarios beta
3. **PRÓXIMA SEMANA:** Crear contenido para redes
4. **EN 2 SEMANAS:** Lanzar en Product Hunt

---

*Plan creado: Mayo 2025*
*Revisar y ajustar mensualmente según resultados*
