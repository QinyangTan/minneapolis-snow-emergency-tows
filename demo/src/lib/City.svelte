<script>
  import { onMount } from 'svelte';
  import { geoMercator, geoPath } from 'd3';
  import { createCity } from './scene.js';
  let { data, geography, water, day, unfolded, selected, topView, onselect, onlayout,
    metric='count',maximum,comparison=null,highlightIds=[],resetKey=0 } = $props();
  let canvas;
  let controller = $state.raw(null);
  let labels = $state([]);
  let failed = $state(false);
  const projection = $derived(geoMercator().fitExtent([[20,20],[540,640]],geography));
  const path = $derived(geoPath(projection));
  onMount(()=>{
    try {
      controller=createCity(canvas,data,geography,water,{
        onSelect:onselect,onLabels:next=>labels=next,onFailure:()=>failed=true,onLayout:onlayout,maximum
      });
      controller.update({data,day,unfolded,selected,topView,metric,maximum,comparison,highlightIds,resetKey});
    } catch { failed=true; }
    return ()=>controller?.dispose();
  });
  $effect(()=>{controller?.update({data,day,unfolded,selected,topView,metric,maximum,comparison,highlightIds,resetKey});});
</script>

<div class="city-stage" class:failed data-testid="city-stage">
  {#if !failed}<button class="camera-reset" onclick={()=>controller?.resetView()} aria-label="Reset camera rotation and zoom">Reset view</button>{/if}
  <canvas bind:this={canvas} tabindex="0" style="touch-action:none;cursor:grab" aria-label="Interactive Minneapolis map. Drag to rotate, scroll to zoom, click to select. Arrow keys rotate, plus and minus zoom, Home resets the view. Use labeled controls for exact data."></canvas>
  {#if !failed}
    <div class="map-labels" aria-hidden="true">
      {#each labels as label,i (i)}
        <span class={`map-label ${label.kind}`} style:left={`${label.x}px`} style:top={`${label.y}px`}>
          {#if label.kind==='selected'}<b>{label.undefined?'N/A':label.count===null?'…':label.unit==='share'?`${label.count.toFixed(1)}%`:label.count}</b><small>{label.text}</small>{:else}{label.text}{/if}
        </span>
      {/each}
    </div>
  {:else}
    <div class="map-fallback">
      <p>3D is unavailable in this browser. Explore the same records with the map and table.</p>
      <svg viewBox="0 0 560 660" role="img" aria-label="Minneapolis neighborhood map, selected region highlighted">
        {#each geography.features as f}<path d={path(f)} fill={f.properties.id===selected?'#168aad':'#e0edf3'} stroke="#8da5b5" stroke-width=".8" />{/each}
        {#each water.features as f}<path d={path(f)} fill="#315d76" />{/each}
      </svg>
    </div>
  {/if}
</div>

<style>
  canvas:focus-visible{outline:3px solid #176a8a;outline-offset:-4px}
  .camera-reset{position:absolute;bottom:47px;right:0;z-index:2;padding:6px 8px;font-size:13px;color:#173449;border-bottom:1px solid #c5d5de;min-height:32px}
  @media(max-width:800px){.camera-reset{bottom:8px;right:18px;font-size:12px}}
</style>
