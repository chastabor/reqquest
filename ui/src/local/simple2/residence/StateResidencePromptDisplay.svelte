<script lang="ts">
  import ResidencePromptDisplay from "../_templates/ResidencePromptDisplay.svelte"
  export let data: any
  export let gatheredConfigData: any
</script>

<ResidencePromptDisplay {data} promptKey="state_residence_prompt" isResident="residentOfRequiredState" stateLabel={gatheredConfigData.residentOfState} notResidentMessage={`Not a resident of ${gatheredConfigData.residentOfState}.`} />
