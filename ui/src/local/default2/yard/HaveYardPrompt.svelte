<script lang="ts">
  import { FieldNumber, FieldRadio } from '@txstate-mws/carbon-svelte'
  import QuestionnairePrompt from "../_templates/QuestionnairePrompt.svelte"
  export let data: any
</script>

<QuestionnairePrompt title="Yard Information." description="Please provide some information about your yard to help us ensure it's a safe environment for your new pet." externalLinks={[{ url: "https://www.aspca.org/", label: "Yard Safety Tips from ASPCA" }, { url: "https://www.humanesociety.org/", label: "Creating a Pet-Friendly Yard from Humane Society" }]}>
  <FieldRadio path="haveYard" boolean legendText="Do you have a yard?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
  <FieldNumber path="squareFootage" labelText="Square Footage" conditional={data.haveYard} helperText="Estimate your yard size in square feet." />
  <FieldNumber path="totalPets" labelText="Total Pets" conditional={data.haveYard} helperText="How many pets will be sharing this yard after the adoption?" />
</QuestionnairePrompt>
