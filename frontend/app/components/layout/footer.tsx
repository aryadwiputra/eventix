import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary/50 border-t border-primary">
      <div className="max-w-screen-xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3">
            Eventix
          </h3>
          <p className="text-pastel-purple text-sm">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.events")}</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <Link to="/events" className="hover:text-white">
              {t("footer.browseEvents")}
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.account")}</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <Link to="/auth/login" className="hover:text-white">
              {t("footer.signIn")}
            </Link>
            <Link to="/auth/register" className="hover:text-white">
              {t("footer.register")}
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.legal")}</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <span className="text-pastel-purple">{t("footer.privacyPolicy")}</span>
            <span className="text-pastel-purple">{t("footer.termsOfService")}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary text-center py-4 text-sm text-pastel-purple">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
