<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isAutomated" boolean labelText="Have you ever written a script to automate a repetitive task?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldTextInput path="descriptionOfAutomation" labelText="Describe the task(s) that you've automated and why. Feel free to include any links if this is already documented.\n" conditional={data.isAutomated === true} />
