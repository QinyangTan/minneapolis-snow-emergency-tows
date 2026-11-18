<script lang="ts">
  import { onMount } from 'svelte';
  import StoryGraphic from './StoryGraphic.svelte';
  import { steps } from './storyModel.mjs';

  type Props = { story: any; geography: any; selected?: string | null; onselect?: (name: string) => void };
  let { story, geography, selected = null, onselect = () => {} }: Props = $props();

  let active = $state(0);
  let stepNodes: HTMLElement[] = $state([]);
  const view = $derived(steps[active]?.view ?? 'year');
  const scene = $derived(steps[active]?.scene ?? 1);

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active = Number((entry.target as HTMLElement).dataset.step);
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    stepNodes.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  });

  const sceneNames = ['The hook', 'When', 'Where', 'Why', 'Explore'];
</script>

<section class="scrolly" aria-labelledby="story-title">
  <div class="scrolly-intro">
    <p class="eyebrow">THE STORY · SCROLL TO ADVANCE</p>
    <h2 id="story-title">The snow rule is the same on every street.<br /><em>The tows are not.</em></h2>
    <p>Five short scenes: how big storm towing is, when it happens, where it lands, and who carries it. Scroll slowly; the chart on the right changes one thing at a time.</p>
  </div>
  <div class="scrolly-body">
    <div class="scrolly-steps">
      {#each steps as step, i (step.id)}
        <article class="step" class:active={i === active} data-step={i} bind:this={stepNodes[i]}>
          {#if step.sceneTitle}<p class="scene-label">SCENE {step.scene} · {step.sceneTitle.toUpperCase()}</p>{/if}
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          {#if step.id === 'explore'}<a class="step-link" href="#focus-dashboard">Open the dashboard ↓</a>{/if}
        </article>
      {/each}
    </div>
    <div class="scrolly-graphic">
      <ol class="scene-track" aria-label="Story progress">
        {#each sceneNames as name, i}
          <li class:done={scene > i + 1} class:current={scene === i + 1}><span>{i + 1}</span>{name}</li>
        {/each}
      </ol>
      <StoryGraphic {story} {geography} {view} {selected} {onselect} />
    </div>
  </div>
</section>

<style>
  .scrolly { background: #f4f8fb; padding: 90px max(5%, calc((100vw - 1240px) / 2)) 40px; border-top: 1px solid #dde7ef; }
  .scrolly-intro { max-width: 760px; margin-bottom: 30px; }
  .scrolly-intro .eyebrow { color: #3c5e78; }
  .scrolly-intro h2 { font: 700 clamp(34px, 4.4vw, 54px)/1.05 'Space Grotesk', sans-serif; letter-spacing: -0.04em; color: #0b1d32; margin: 14px 0; }
  .scrolly-intro p:last-child { font-size: 17px; line-height: 1.7; color: #38566d; }
  .scrolly-body { display: grid; grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.5fr); gap: 36px; align-items: start; }
  .scrolly-steps { padding-bottom: 30vh; }
  .step { min-height: 72vh; display: flex; flex-direction: column; justify-content: center; opacity: 1; border-left: 3px solid transparent; padding-left: 14px; transition: border-color 300ms ease; }
  .step.active { border-left-color: #215a89; }
  .step h3 { font: 700 26px/1.2 'Space Grotesk', sans-serif; color: #0b1d32; margin: 6px 0 10px; letter-spacing: -0.02em; }
  .step p { font-size: 16.5px; line-height: 1.7; color: #2b3f55; margin: 0; max-width: 46ch; }
  .scene-label { font: 700 12px 'Space Grotesk', sans-serif !important; letter-spacing: 0.14em; color: #215a89 !important; margin-bottom: 4px !important; }
  .step-link { margin-top: 14px; font-weight: 700; color: #a8343e; text-decoration: none; }
  .scrolly-graphic { position: sticky; top: 4vh; }
  .scene-track { list-style: none; padding: 0; margin: 0 0 10px; display: flex; gap: 6px; flex-wrap: wrap; }
  .scene-track li { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #415b70; padding: 4px 10px 4px 4px; border-radius: 999px; background: #e8f0f6; }
  .scene-track span { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #ffffff; font-size: 11px; }
  .scene-track li.done { color: #1f5a8a; }
  .scene-track li.current { background: #0b1d32; color: #ffffff; }
  .scene-track li.current span { background: #a2353e; color: #ffffff; }
  @media (max-width: 900px) {
    .scrolly-body { grid-template-columns: 1fr; }
    .scrolly-graphic { order: -1; top: 0; z-index: 2; background: #f4f8fb; padding-bottom: 8px; }
    .step { min-height: 60vh; }
    .step { justify-content: flex-end; }
    .step > * { background: rgba(255, 255, 255, 0.94); padding: 6px 12px; margin: 0; }
    .step > :first-child { border-radius: 8px 8px 0 0; padding-top: 12px; }
    .step > :last-child { border-radius: 0 0 8px 8px; padding-bottom: 12px; }
  }
  @media (prefers-reduced-motion: reduce) { .step { transition: none; } }
</style>
