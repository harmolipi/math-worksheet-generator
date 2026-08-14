<script lang="ts">
  let count = $state(0);
</script>

<main>
  <h1>Math Worksheet Generator</h1>
  <p>Under construction — the engine, content catalog, and worksheet UI are on their way.</p>
  <button onclick={() => (count += 1)}>count is {count}</button>
</main>

<style>
  main {
    max-width: 40rem;
    margin: 4rem auto;
    font-family: system-ui, sans-serif;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
  }
</style>
