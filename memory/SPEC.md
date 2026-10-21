# Express Baterias Rio — site spec

Redesign of expressbateriasrio.com.br: conversion site for battery roadside replacement in Rio + battery finder + admin.

## Confirmed business data (from current site)
Phone/WhatsApp (21) 99940-4005; Instagram @expressbateriasrj; Google Maps cid=5553564379686471721;
areas Zona Sul, Centro, Barra da Tijuca (+ neighborhood list in lib/contact.ts); até 30 min; entrega e instalação grátis;
10x sem juros; "achou mais barato a gente cobre"; 10 anos no Rio; 453 avaliações Google (rating "Excelente"); real reviews in Reviews.tsx.
NOT available / to confirm: street address, opening hours, CNPJ, warranty term, battery brands sold, real product photos.

## Routes
- `/` home: hero, finder, services, differentials, service area + quote form (#orcamento), reviews, FAQ, CTA
- `/encontre-sua-bateria` finder; `?v=<vehicleId>&ano=<year>` shows result panel
- `/admin` login + dashboard (tabs: pedidos, veículos e aplicações, baterias)

## Data model (Mongo)
- batteries: id, code (unique), brand, line, ah, cca?, technology (Convencional|EFB|AGM), polarity (D|E), length/width/height_mm?, image_url?, price?, in_stock?, notes
- vehicles: id, make, model, engine, version, year_from, year_to, start_stop, battery_ids (ordered; first = main), validated, popular, notes, search_text
- quotes: id, name, phone, vehicle, neighborhood, need, message, vehicle_id?, battery_code?, source, status (novo|em_atendimento|concluido), created_at
- admins: id, email, name, password_hash (PBKDF2)

## API (/api)
Public: GET finder/makes, finder/models?make, finder/years?make&model, finder/versions?make&model&year, finder/search?q, finder/popular, finder/result/{id}; POST quotes.
Auth: POST auth/login, auth/logout, GET auth/me (JWT cookie).
Admin (cookie required): CRUD admin/batteries, admin/vehicles; GET admin/quotes, PATCH admin/quotes/{id}.

## Seed (backend/seed.py, idempotent)
11 reference batteries REF-40D…REF-100D (brand "A confirmar"), 29 vehicles (Onix, HB20, Compass, Polo, T-Cross, Kwid, Gol, Corolla…), ALL validated=false
→ result page shows "Aguardando validação técnica" banner. Popular chips = vehicles with popular=true (one per model).
