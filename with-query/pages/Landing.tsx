import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, BarChart3, Users, Zap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-warm-beige">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-soft-orange rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-xl text-dark-text">{t('brand.name')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="bg-soft-orange hover:bg-soft-orange/90 text-white"
            >
              {t('landing.hero.signIn')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-dark-text mb-6">
            {t('landing.hero.title')}<br />
            <span className="text-soft-orange">{t('landing.hero.subtitle')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('landing.hero.description')}
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-soft-orange hover:bg-soft-orange/90 text-white text-lg px-8 py-3"
          >
            {t('landing.hero.getStarted')}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white border-border">
            <CardContent className="p-6 text-center">
              <Database className="w-12 h-12 text-soft-orange mx-auto mb-4" />
              <h3 className="font-semibold text-dark-text mb-2">{t('landing.features.visualBuilder.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.visualBuilder.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-soft-orange mx-auto mb-4" />
              <h3 className="font-semibold text-dark-text mb-2">{t('landing.features.smartVisualizations.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.smartVisualizations.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-soft-orange mx-auto mb-4" />
              <h3 className="font-semibold text-dark-text mb-2">{t('landing.features.teamCollaboration.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.teamCollaboration.description')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-soft-orange mx-auto mb-4" />
              <h3 className="font-semibold text-dark-text mb-2">{t('landing.features.lightningFast.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.lightningFast.description')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-12 border border-border">
          <h2 className="text-3xl font-bold text-dark-text mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-soft-orange hover:bg-soft-orange/90 text-white text-lg px-8 py-3"
          >
            {t('landing.cta.startBuilding')}
          </Button>
        </div>
      </main>
    </div>
  );
}
