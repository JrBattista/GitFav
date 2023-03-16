import { GithubUser } from './githubUser.js'

class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(user => user.login === username)
      if (userExists) {
        throw new Error('Usuário já existente!')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.root.querySelector('.search input').value = ''
      this.add(value)
    }
  }
  update() {
    this.removeAllTr()

    if (this.entries != '') {
      this.entries.forEach(user => {
        const row = this.createRow()

        row.querySelector('.user img').src = `https://github.com/${user.login}.png`

        row.querySelector('.user img').alt = `Imagem de ${user.name}`
        row.querySelector('.user a').href = `https://github.com/${user.login}`
        row.querySelector('.user p').textContent = user.name
        row.querySelector('.user span').textContent = user.login
        row.querySelector('.repositories').textContent = user.public_repos
        row.querySelector('.followers').textContent = user.followers
        row.querySelector('.remove').onclick = () => {
          const isOk = confirm('Tem certeza que deseja deletar este usuário?')
          if (isOk) {
            this.delete(user)
          }
        }

        this.tbody.append(row)
      })
    } else {
      const emptRow = this.createEmptRow()
      this.tbody.append(emptRow)
    }
  }

  createEmptRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="empt-list" colspan="4">
        <div class="container-empt">
          <img src="images/Estrela.png">
          <span>Nenhum favorito ainda</span>
        </div>
      </td>
    `

    return tr
  }
  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/maykbrito.png" alt="imagem do maykbrito">
      <a href="https://github.com/maykbrito" target="_blank">
        <p>Mayk Brito</p>
        <span>maykbrito</span>
      </a>
    </td>
    <td class="repositories">
      89
    </td>
    <td class="followers">
      26262
    </td>
    <td class="actions">  
      <button class="remove">
        Remover
      </button>
    </td>
  
  `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}