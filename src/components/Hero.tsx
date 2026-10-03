"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Sparkles } from "lucide-react";

const SLIDES = [
	{
		id: 1,
		image: "/images/sideImg.jpg",
		title: "Living Spaces, Reimagined",
		subtitle: "Clutter-free, calm, and functional living room organization.",
	},

	{
		id: 2,
		image: "/images/Cozy Chic Living Space.jpg",
		title: "Productive Workspaces",
		subtitle: "Streamlined home offices designed for maximum focus.",
	},
	{
		id: 3,
		image: "/images/Sala de estar e jantar.jpg",
		title: "Seamless Storage",
		subtitle: "Custom pantry and storage solutions tailored to your routine.",
	},
];

export default function Hero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [slotsRemaining, setSlotsRemaining] = useState(18); // Dynamic offer tracker

	// Auto-advance slides every 5 seconds
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
	const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));

	return (
		<section className="relative overflow-hidden bg-cream py-12 md:py-20">
			{/* Background Glow */}
			<div className="pointer-events-none absolute -left-24 top-24 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />

			<div className="container-froska grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
				{/* Left Column: Hero Copy & Offer */}
				<motion.div
					className="lg:col-span-6"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
				>
					{/* Promo Badge */}

					{/* Heading */}
					<h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
						20 Homes. <br />
						<span className="text-green-700">Completely Free</span>
					</h1>

					{/* Body Copy */}
					<p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
						We’re giving the first 20 homes a complete organisation and cleaning transformation
					</p>
					<Link
						href="#launch-offer"
						className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:gap-2.5 transition-all"
					>
					See more <ArrowRight size={16} />
					</Link>





					{/* CTAs */}
					<div className="mt-8 flex flex-wrap items-center gap-4">
						<Link href="/book" className="btn-primary group">
							Claim Your Free Slot
							<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
						</Link>
						<Link href="#how-it-works" className="btn-secondary">
							See How It Works
						</Link>
					</div>

					{/* Live Slots Counter */}
					<div className="mt-8 flex items-center gap-3 border-t border-line/60 pt-6">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
							<Gift size={20} />
						</div>
						<div>
							<p className="text-sm font-semibold text-ink">
								Only{" "}
								<span className="text-green-700">{slotsRemaining} free slots</span> left
							</p>
							<p className="text-xs text-ink/50">First-come, first-served. No hidden fees.</p>
						</div>
					</div>
				</motion.div>

				{/* Right Column: Dynamic Image Carousel */}
				<motion.div
					className="relative lg:col-span-6"
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
				>
					{/* Increased height: use explicit responsive heights for a taller display */}
					<div className="relative mx-auto h-[420px] sm:h-[520px] md:h-[640px] w-full overflow-hidden rounded-2xl shadow-lift">
						<AnimatePresence mode="wait">
							<motion.div
								key={currentSlide}
								initial={{ opacity: 0, scale: 1.03 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.6, ease: "easeInOut" }}
								className="absolute inset-0"
							>
								<Image
									src={SLIDES[currentSlide].image}
									alt={SLIDES[currentSlide].title}
									fill
									priority
									sizes="(max-width: 1024px) 100vw, 50vw"
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

								{/* Slide Caption Overlay */}
								<div className="absolute bottom-6 left-6 right-6 text-white">
									<p className="text-sm font-medium text-white/80">
										{SLIDES[currentSlide].subtitle}
									</p>
									<h3 className="text-xl font-bold">{SLIDES[currentSlide].title}</h3>
								</div>
							</motion.div>
						</AnimatePresence>

						{/* Carousel Navigation Arrows */}
						<button
							onClick={prevSlide}
							aria-label="Previous slide"
							className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur-md transition-all hover:bg-white"
						>
							<ChevronLeft size={20} />
						</button>
						<button
							onClick={nextSlide}
							aria-label="Next slide"
							className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur-md transition-all hover:bg-white"
						>
							<ChevronRight size={20} />
						</button>
					</div>

					{/* Slide Indicator Dots */}
					<div className="mt-4 flex justify-center gap-2">
						{SLIDES.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setCurrentSlide(idx)}
								aria-label={`Go to slide ${idx + 1}`}
								className={`h-2.5 rounded-full transition-all ${
									currentSlide === idx
										? "w-8 bg-green-700"
										: "w-2.5 bg-ink/20 hover:bg-ink/40"
								}`}
							/>
						))}
					</div>
				</motion.div>

				{/* image viewer removed per request */}
			</div>
		</section>
	);
}