import { computed, reactive, ref } from 'vue'
import axios from 'axios'
import useEmailSelection from '@/composables/use-email-selection'


let useEmailManager = async function() {
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

  }
}

export default useEmailManager