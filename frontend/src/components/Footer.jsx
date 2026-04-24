import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">TechAds</span>
          <p>Майданчик для купівлі та продажу комп'ютерної техніки</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Оголошення</h4>
            <Link to="/">Всі оголошення</Link>
            <Link to="/listings/create">Додати оголошення</Link>
            <Link to="/favorites">Обране</Link>
          </div>
          <div className="footer__col">
            <h4>Акаунт</h4>
            <Link to="/profile">Профіль</Link>
            <Link to="/login">Вхід</Link>
            <Link to="/register">Реєстрація</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} TechAds.</p>
      </div>
    </footer>
  )
}