<script lang="ts">
  import { FieldRadio, FieldTextInput } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="isContributed" boolean labelText="Independent contributions?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
<FieldTextInput path="recap" labelText="Describe the project you worked on and issues you encountered. If using GitHub, please include a link to your account. (free text field)\n" conditional={data.isContributed === true} />
