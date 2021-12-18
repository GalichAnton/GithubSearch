import axios from 'axios';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import './App.css';
import useDebounce from './UseDebounce';

interface IUser {
  id: string
  avatar_url: string
  name: string
  location: string
  public_repos: number | null
  bio: string
  login: string
  followers: number | null
  following: number | null
  email: string
}

const App: FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<IUser | null>()
  let url = new URL(window.location.toString());


  const onInputChange = (e: SyntheticEvent<HTMLInputElement>): void => {
    setInputValue(e.currentTarget.value)
  }


  const searchUser = (username: string) => {
    console.log('search')
    setIsLoading(true)
    axios.get(`https://api.github.com/users/${username}`).then((res) => {
      const newUser: IUser = {
        id: res.data.id,
        avatar_url: res.data.avatar_url,
        name: res.data.name,
        location: res.data.location,
        public_repos: res.data.public_repos,
        followers: res.data.followers,
        bio: res.data.bio,
        login: res.data.login,
        following: res.data.following,
        email: res.data.email
      }
      url.searchParams.set('login', newUser.login);
      window.history.pushState(null, '', url.href)
      setUser(newUser)
      setIsLoading(false)
    })
      .catch(err => {
        if (err.response) {
          alert('Такого юзера нет')
        } else if (err.request) {
          alert('Ошибка сервера')
        } else {
          alert('Что то пошло не так ¯\_(ツ)_/¯')
        }
        setIsLoading(false)
      })
  }

  const onSearch = async (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault()
    searchUser(inputValue)
  }

  const debouncedSearchTerm = useDebounce(inputValue, 2500);

  useEffect(() => {
    setInputValue('')
    setUser(null)
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUser(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm]);

  return (
    <div id="app">
      <div className="app-container">
        <form className="app-form">
          <input type="text"
            className="app-input"
            placeholder="Укажите GitHub-аккаунт"
            value={inputValue}
            onChange={(e) => onInputChange(e)}
          />
          <button
            type='submit'
            className={`app-form_btn ${isLoading ? 'disabled' : null}`}
            onClick={(e) => onSearch(e)}
            disabled={isLoading}
          >Найти</button>
        </form>
        {isLoading ? <h2>Подождите идет загрузка</h2>
          : user ? (<div className="app-user">
            <div className="app-user_info">
              <div className="app-user_image">
                <img src={user?.avatar_url} alt="" />
              </div>
              <div className="app-user_data">
                <h1 className="app-user_name">
                  {user?.name}
                  <span>@{user?.login}</span>
                </h1>
                <p className="app-user_about">
                  {user?.bio}
                </p>
              </div>
            </div>
            <ul className="app-user_stats">
              <li className="app-user_stats-item">
                Репозитории
                <span>{user?.public_repos}</span>
              </li>
              <li className="app-user_stats-item">
                Подписчиков
                <span>{user?.followers}</span>
              </li>
              <li className="app-user_stats-item">
                Подписок
                <span>{user?.following}</span>
              </li>
            </ul>
            <ul className="app-user_location">
              <li className="app-user_location-item">{user?.location}</li>
              <li className="app-user_location-item">
                <a href={user?.email}>{user?.email}</a>
              </li>
            </ul>
          </div>

          ) : (<h2>Введите имя пользователя в поисковой строке</h2>)}


      </div>
    </div>
  );
}

export default App;
