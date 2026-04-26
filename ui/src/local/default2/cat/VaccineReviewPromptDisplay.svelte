<script lang="ts">
  import SatisfactoryReviewSetDisplay from "../_templates/SatisfactoryReviewSetDisplay.svelte"
  export let data: any
</script>

<SatisfactoryReviewSetDisplay {data} items={[{ path: "distemper", label: "Distemper vaccination" }, { path: "rabies", label: "Rabies vaccination" }, { path: "felineLeukemia", label: "Feline leukemia vaccination" }, { path: "felineHIV", label: "Feline HIV vaccination" }]} />
