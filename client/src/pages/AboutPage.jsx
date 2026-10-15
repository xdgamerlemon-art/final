import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Leaf, HandHeart, Sparkles } from 'lucide-react';
import './AboutPage.css';

const values = [
  { icon: <HandHeart size={22}/>, title: 'Made by real people', text: 'Every piece comes from an independent maker with a point of view, a practice, and a pair of hands behind it.' },
  { icon: <Leaf size={22}/>, title: 'Made to be kept', text: 'We believe in thoughtful buying: choosing fewer, better things that bring a little meaning to everyday life.' },
  { icon: <Heart size={22}/>, title: 'A fairer kind of shop', text: 'A marketplace that helps makers reach people who value their craft, without losing the human story along the way.' }
];

export default function AboutPage() {
  return <main className="about-page">
    <section className="about-hero">
      <div className="about-hero-copy"><span className="eyebrow"><Sparkles size={14}/> A MARKETPLACE WITH MEANING</span><h1>Good things,<br/><em>made with heart.</em></h1><p>ArtisanCraft brings independent makers and thoughtful shoppers together. We make it easier to find the little things that make a home feel like yours—and the people who made them.</p><Link className="button button-primary" to="/products">Find your handmade favorite <ArrowRight size={16}/></Link></div>
      <div className="about-hero-art" aria-label="Handmade pottery illustration"><span className="about-sun">✳</span><span className="about-pot">◖</span><span className="about-art-note">small batch<br/>big heart</span></div>
    </section>
    <section className="about-manifesto"><span className="eyebrow">WHY WE'RE HERE</span><h2>Behind every lovely thing<br/>is <em>someone who cared.</em></h2><p>We started ArtisanCraft with a simple thought: shopping can feel more personal. A bowl can carry the quiet of a potter's studio. A woven cloth can hold the color of a place. When you choose handmade, you bring a maker's time, skill, and story into your everyday.</p><p>So we built a little corner of the internet for independent artisans to share their work—and for curious people to find pieces worth keeping.</p></section>
    <section className="about-values">{values.map((value) => <article className="about-value-card" key={value.title}><span>{value.icon}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}</section>
    <section className="about-maker-cta"><div><span className="eyebrow">YOUR WORK BELONGS HERE</span><h2>Make things?<br/><em>Meet your people.</em></h2><p>Bring your craft to a community that loves the care behind it. Every new product is reviewed before it appears in the shop.</p><Link className="button button-light" to="/register">Join as a maker <ArrowRight size={16}/></Link></div><div className="about-cta-mark" aria-hidden="true">✿</div></section>
  </main>;
}
