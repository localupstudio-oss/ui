"use client"

import Image from "next/image"
import { useState } from "react"
import { Car, Clock, MapPin, Navigation, ParkingSquare, Route, TrainFront } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeading } from "@/components/section-heading"
import { DemoBadge } from "@/components/demo-badge"
import { Reveal } from "@/components/motion/reveal"
import { directions, parkings } from "@/content/experience"
import { fullAddress, site } from "@/content/site"

const q = encodeURIComponent(fullAddress)
const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${q}`
const mapsEmbed = `https://www.google.com/maps?q=${q}&output=embed`
const nearbyParking = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parcheggi vicino ${fullAddress}`)}`

export function Location() {
  // La mappa Google (che imposta cookie di terze parti) si carica solo su richiesta dell'utente.
  const [mapLoaded, setMapLoaded] = useState(false)

  return (
    <section id="location" className="py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Location, mappe & parcheggi"
            title={
              <>
                Nel cuore di <span className="text-brass-gradient italic">Cava de&apos; Tirreni.</span>
              </>
            }
            intro={`${fullAddress}. A due passi dai portici del Corso, facilmente raggiungibile in auto e in treno.`}
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <Reveal className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-border lg:col-span-7">
            {mapLoaded ? (
              <iframe
                title={`Mappa di ${site.fullName}`}
                src={mapsEmbed}
                className="absolute inset-0 size-full border-0 [filter:grayscale(0.35)_contrast(1.05)]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0">
                <Image src="/images/locale/bancone.jpg" alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-40 blur-[2px]" />
                <div className="absolute inset-0 grid place-items-center bg-background/50 p-6 text-center">
                  <div className="max-w-sm">
                    <MapPin className="mx-auto size-10 text-brass" />
                    <p className="mt-4 font-display text-3xl">{site.address.street}</p>
                    <p className="text-muted-foreground">{site.address.zip} {site.address.city} ({site.address.province})</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button onClick={() => setMapLoaded(true)} className="rounded-full">Mostra la mappa</Button>
                      <Button asChild variant="outline" className="rounded-full bg-transparent">
                        <a href={mapsDirections} target="_blank" rel="noopener noreferrer"><Navigation className="size-4" /> Indicazioni</a>
                      </Button>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Caricando la mappa accetti i cookie di Google Maps.</p>
                  </div>
                </div>
              </div>
            )}
          </Reveal>

          <div className="grid gap-6 lg:col-span-5">
            <Reveal delay={0.1}>
              <Card className="rounded-[2rem] border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-2xl font-medium">
                    <ParkingSquare className="size-5 text-brass" /> Parcheggi vicini <DemoBadge />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {parkings.map((p) => (
                      <li key={p.name} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                        <div className="flex gap-3">
                          {p.type === "Treno" ? <TrainFront className="mt-0.5 size-4 text-brass" /> : <Car className="mt-0.5 size-4 text-brass" />}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.type} · {p.note}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-brass/10 px-3 py-1 text-xs text-brass-light">{p.walk}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="link" className="mt-2 h-auto px-0 text-brass">
                    <a href={nearbyParking} target="_blank" rel="noopener noreferrer">Vedi tutti i parcheggi su Google Maps →</a>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card className="rounded-[2rem] border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-2xl font-medium">
                    <Route className="size-5 text-brass" /> Come arrivare
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {directions.map((d) => (
                    <div key={d.from}>
                      <p className="text-xs font-semibold tracking-[0.2em] text-brass uppercase">{d.from}</p>
                      <p className="mt-1 text-sm text-foreground/80">{d.text}</p>
                    </div>
                  ))}
                  <p className="flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                    <Clock className="size-4 text-brass" /> Aperti dal mercoledì alla domenica
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
