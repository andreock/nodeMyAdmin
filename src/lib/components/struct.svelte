<script lang="ts">
    export let structure: Table;
</script>

<div class="table_container">
   <table class="table">
       <thead>
           <tr>
               <th scope="col">Name</th>
               <th scope="col">DataType</th>
               <th scope="col">Key</th>
               <th scope="col">Nullable</th>
               <th scope="col">Default</th>
               <th scope="col">Extra</th>
           </tr>
       </thead>
       <tbody>
           {#each structure.cols as field}
               <tr>
                   <td>{field.Field}</td>
                   <td>{field.Type}</td>
                   <td>{field.Key}</td>
                   <td>{field.Null}</td>
                   <td>{field.Default}</td>
                   <td>{field.Extra}</td>
               </tr>
           {/each} 
       </tbody>
   </table>
</div>

<style>
   .table_container {
       padding-left: 20em;
       margin-top: 4em;
   }
</style>
