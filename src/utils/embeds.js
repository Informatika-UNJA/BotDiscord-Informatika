const { EmbedBuilder } = require('discord.js');
const { COLORS, WELCOME, LEAVE, VERIFY_PANEL, VERIFY_RESULT, KOMTING } = require('../config/messages');

function fill(template, vars) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template
  );
}

/* ---------------------- WELCOME / LEAVE ---------------------- */
function buildWelcomeEmbed(member) {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() || undefined })
    .setTitle(WELCOME.title)
    .setDescription(fill(WELCOME.descriptionTemplate, { member: `${member}` }))
    .addFields({ name: '👋 Pesan Untukmu', value: WELCOME.field })
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({
      text: fill(WELCOME.footerTemplate, { count: member.guild.memberCount }),
      iconURL: member.guild.iconURL() || undefined,
    })
    .setTimestamp();
}

function buildLeaveEmbed(member) {
  const tag = member.user?.tag || member.user?.username || 'Seseorang';
  return new EmbedBuilder()
    .setColor(COLORS.leave)
    .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() || undefined })
    .setTitle(LEAVE.title)
    .setDescription(fill(LEAVE.descriptionTemplate, { tag }))
    .addFields({ name: '💬 Pesan Perpisahan', value: LEAVE.field })
    .setThumbnail(member.user?.displayAvatarURL({ size: 256 }) || null)
    .setFooter({
      text: fill(LEAVE.footerTemplate, { count: member.guild.memberCount }),
      iconURL: member.guild.iconURL() || undefined,
    })
    .setTimestamp();
}

/* ---------------------- VERIFIKASI ---------------------- */
function buildVerifyPanelEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle(VERIFY_PANEL.title)
    .setDescription(VERIFY_PANEL.description)
    .addFields({ name: VERIFY_PANEL.rulesFieldName, value: VERIFY_PANEL.rulesFieldValue })
    .setFooter({ text: VERIFY_PANEL.footer })
    .setTimestamp();
}

function buildVerifyErrorEmbed(title, description) {
  return new EmbedBuilder().setColor(COLORS.danger).setTitle(title).setDescription(description).setTimestamp();
}

function buildVerifyInfoEmbed(title, description) {
  return new EmbedBuilder().setColor(COLORS.warning).setTitle(title).setDescription(description).setTimestamp();
}

function buildVerifySuccessEmbed({ nama, nim, angkatan, jabatan, roleMentions }) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(VERIFY_RESULT.successTitle)
    .setDescription(fill(VERIFY_RESULT.successDescBase, { nama }))
    .addFields(
      { name: 'Nama Lengkap', value: nama, inline: true },
      { name: 'NIM', value: nim, inline: true },
      { name: 'Angkatan', value: angkatan, inline: true }
    )
    .setFooter({ text: VERIFY_RESULT.successFooter })
    .setTimestamp();

  if (jabatan) {
    embed.addFields({ name: 'Jabatan', value: jabatan, inline: true });
  }
  if (roleMentions && roleMentions.length > 0) {
    embed.addFields({ name: 'Role Diberikan', value: roleMentions.join(', ') });
  }
  return embed;
}

/* ---------------------- KOMTING ---------------------- */
function buildKomtingSuccessEmbed({ jumlah, label, channelMentions }) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(KOMTING.successTitle)
    .setDescription(fill(KOMTING.successDescTemplate, { jumlah, label }))
    .addFields({ name: 'Voice Channel', value: channelMentions.join('\n') })
    .setTimestamp();
}

function buildKomtingCloseEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(KOMTING.closeSuccessTitle)
    .setDescription(KOMTING.closeSuccessDesc)
    .setTimestamp();
}

function buildKomtingNoSessionEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle(KOMTING.noSessionTitle)
    .setDescription(KOMTING.noSessionDesc)
    .setTimestamp();
}

module.exports = {
  buildWelcomeEmbed,
  buildLeaveEmbed,
  buildVerifyPanelEmbed,
  buildVerifyErrorEmbed,
  buildVerifyInfoEmbed,
  buildVerifySuccessEmbed,
  buildKomtingSuccessEmbed,
  buildKomtingCloseEmbed,
  buildKomtingNoSessionEmbed,
};
