<script lang="ts">
  import ResidencePrompt from "../_templates/ResidencePrompt.svelte"
  export let data: any
  export let gatheredConfigData: any
</script>

<ResidencePrompt {data} gate={{ path: "residentOfRequiredState", legend: `Are you a resident of ${gatheredConfigData.residentOfState}?`, showWhen: "yes" }} upload={{ path: "residentIdDoc", label: "Residence identification document" }} />
