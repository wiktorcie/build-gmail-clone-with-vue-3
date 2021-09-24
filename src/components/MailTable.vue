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
import axios from 'axios'
import MailView from '@/components/MailView.vue'
import ModalView from '@/components/ModalView.vue'
import BulkActionBar from '@/components/BulkActionBar.vue'
import useEmailSelection from '@/composables/use-email-selection'
import { computed, ref, reactive } from 'vue'

export default {
  components: {
    MailView,
    ModalView,
    BulkActionBar
  },
  async setup() {

    let res = await axios.get('http://localhost:3000/emails')
    let emails = reactive(res.data)
    let selectedScreen = ref('inbox')
    let openedEmail = ref(null)
    let emailSelection = useEmailSelection()

    function openEmail(email) {
      openedEmail.value = email
      if(email) {
        email.read = true
        updateEmail(email)
      }
    }
    function archiveEmail(email) {
      email.value.archived = true
      updateEmail(email)
    }
    function updateEmail(email) {
      axios.put(`http://localhost:3000/emails/${email.id}`, email)
    }
    function changeEmail({ toggleRead, toggleArchive, save, closeModal, changeIndex}) {
      let email = openedEmail.value
      if(toggleRead) { email.read = !email.read}
      if(toggleArchive) { email.archived = !email.archived}
      if(save) { updateEmail(email) }
      if(closeModal) { openedEmail.value = null }
      if(changeIndex) {
        let emails = filteredEmails
        let currentIndex = emails.value.indexOf(openedEmail.value)
        let newEmail = emails.value[currentIndex + changeIndex]
        openEmail(newEmail)
      }
    }
    function selectScreen(newScreen) {
      selectedScreen.value = newScreen
      emailSelection.clear()
    }

    const sortedEmails = computed(() => {
      return emails.sort((e1, e2) => {
        return e1.sentAt < e2.sentAt ? 1: -1
      })
    })

    const filteredEmails = computed(() => {
      if(selectedScreen.value == 'inbox' ){
        return sortedEmails.value.filter(e => !e.archived)
      } else {
        return sortedEmails.value.filter(e => e.archived)
      }
    })

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