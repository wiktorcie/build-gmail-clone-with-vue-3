<template>
  <button @click="selectScreen('inbox')"
          :disabled='selectedScreen == "inbox"'>Inbox</button>
  <button @click="selectScreen('archive')"
          :disabled='selectedScreen == "archive"'>Archived</button>

  <BulkActionBar :emails='filteredEmails' />
  <table class='mail-table'>
    <tbody>
      <tr
        v-for='email in filteredEmails'
        :key='email.id'
        :class="['clickable', email.read ? 'read': '']"

      >
        <td>
          <input type="checkbox"
                 @click='emailSelection.toggle(email)'
                 :checked='emailSelection.emails.has(email)'
          />
        </td>
        <td @click='openEmail(email)'>{{ email.from }}</td>
        <td @click='openEmail(email)'>
          <p> <strong>{{ email.subject }}</strong>- {{ email.body }}</p>
        </td>
        <td @click='openEmail(email)' class='date'> {{ format(new Date(email.sentAt), 'MMM do yyyy')  }}</td>
        <td><button @click='archiveEmail(email)'>Archive</button></td>
      </tr>
    </tbody>
  </table>
  <ModalView v-if='openedEmail' @closeModal='openedEmail = null'>
    <MailView :email="openedEmail" @changeEmail='changeEmail' />
  </ModalView>

</template>

<script>
import { format } from 'date-fns';
import MailView from '@/components/MailView.vue'
import ModalView from '@/components/ModalView.vue'
import BulkActionBar from '@/components/BulkActionBar.vue'
import useEmailSelection from '@/composables/use-email-selection'
import useEmailManager from '../composables/use-email-manger'

export default {
  components: {
    MailView,
    ModalView,
    BulkActionBar
  },
  async setup() {

    const { openEmail, archiveEmail, updateEmail, changeEmail,
       selectScreen, sortedEmails, filteredEmails, selectedScreen,
       emails, openedEmail} = await useEmailManager()
    let emailSelection = useEmailSelection()

    return {
      format,
      openEmail,
      archiveEmail,
      updateEmail,
      changeEmail,
      selectScreen,
      sortedEmails,
      filteredEmails,
      selectedScreen,
      emails,
      openedEmail,
      emailSelection
    }
  }
}
</script>

<style>

</style>