FROM php:8.2-apache

# Instala dependências do PHP e Apache
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev \
    zip unzip git curl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ativa módulos do Apache
RUN a2enmod rewrite headers

# Instala Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copia o código
COPY . .

# Instala dependências do Laravel
RUN composer install --no-interaction --optimize-autoloader \
    && composer dump-autoload --optimize

# Permissões
RUN chown -R www-data:www-data /var/www

EXPOSE 80

CMD ["apache2-foreground"]
