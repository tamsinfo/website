import { Link } from "react-router-dom";
import { company, products, services } from "../data/site";
import { Logo } from "./Logo";
import { Icon } from "./ui";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" aria-label="TAMS Infotech home">
            <Logo size={34} />
          </Link>
          <p className="site-footer__desc">{company.description}</p>
          <address className="site-footer__contact">
            <span>
              <Icon name="map-point" size={18} />
              {company.address}
            </span>
            <a href={company.phoneHref}>
              <Icon name="phone" size={18} />
              {company.phone}
            </a>
            <a href={`mailto:${company.email}`}>
              <Icon name="letter" size={18} />
              {company.email}
            </a>
          </address>
        </div>

        <nav className="site-footer__cols" aria-label="Footer">
          <div>
            <h2 className="site-footer__h">Services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="site-footer__h">Products</h2>
            <ul>
              {products.map((s) => (
                <li key={s.slug}>
                  <Link to={`/products/${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="site-footer__h">Company</h2>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/brand">Brand kit</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="site-footer__base">
        <p>© {company.year} {company.legalName}</p>
        <ul className="site-footer__legal">
          <li>
            <Link to="/privacy">Privacy</Link>
          </li>
          <li>
            <Link to="/terms">Terms</Link>
          </li>
          <li>
            <Link to="/cookies">Cookies</Link>
          </li>
          <li>
            <Link to="/sitemap">Sitemap</Link>
          </li>
        </ul>
        <p className="site-footer__tm">{company.trademark}</p>
      </div>
    </footer>
  );
}
